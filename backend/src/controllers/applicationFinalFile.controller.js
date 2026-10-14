import { PDFDocument } from 'pdf-lib'

import { supabase } from '../config/supabase.js'

function getUserId(req) {
  return (
    req.user?.id ||
    req.user?.user?.id ||
    req.auth?.user?.id ||
    null
  )
}

async function getApplication(applicationId) {
  const {
    data: application,
    error,
  } = await supabase
    .from('applications')
    .select(`
      id,
      applicant_id,
      application_number,
      status,
      current_step
    `)
    .eq('id', applicationId)
    .single()

  if (error || !application) {
    return {
      application: null,
      error:
        error?.message ||
        'Application not found',
    }
  }

  return {
    application,
    error: null,
  }
}

async function getApplicationAccess(
  applicationId,
  userId
) {
  if (!userId) {
    return {
      allowed: false,
      role: null,
      application: null,
      message:
        'Authentication required',
    }
  }

  const {
    application,
    error: applicationError,
  } = await getApplication(applicationId)

  if (applicationError) {
    return {
      allowed: false,
      role: null,
      application: null,
      message: applicationError,
    }
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(
      'id, full_name, role'
    )
    .eq('id', userId)
    .single()

  if (
    profileError ||
    !profile
  ) {
    return {
      allowed: false,
      role: null,
      application,
      message:
        'User profile not found',
    }
  }

  if (
    profile.role === 'applicant'
  ) {
    const {
      data: applicant,
      error: applicantError,
    } = await supabase
      .from('applicants')
      .select(
        'id, profile_id'
      )
      .eq(
        'id',
        application.applicant_id
      )
      .eq(
        'profile_id',
        userId
      )
      .maybeSingle()

    if (
      applicantError ||
      !applicant
    ) {
      return {
        allowed: false,
        role: 'applicant',
        application,
        message:
          'You do not have access to this application',
      }
    }

    return {
      allowed: true,
      role: 'applicant',
      application,
      profile,
      message: null,
    }
  }

  if (
    profile.role === 'operator'
  ) {
    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from(
        'application_operator_assignments'
      )
      .select(`
        id,
        application_id,
        operator_id,
        status
      `)
      .eq(
        'application_id',
        applicationId
      )
      .eq(
        'operator_id',
        userId
      )
      .in(
        'status',
        [
          'assigned',
          'in_progress',
          'awaiting_review',
          'completed',
        ]
      )
      .maybeSingle()

    if (
      assignmentError
    ) {
      console.error(
        'Final file assignment check error:',
        assignmentError
      )

      return {
        allowed: false,
        role: 'operator',
        application,
        message:
          'Failed to verify operator assignment',
      }
    }

    if (!assignment) {
      return {
        allowed: false,
        role: 'operator',
        application,
        message:
          'You are not assigned to this application',
      }
    }

    return {
      allowed: true,
      role: 'operator',
      application,
      profile,
      assignment,
      message: null,
    }
  }

  if (
    profile.role === 'admin'
  ) {
    return {
      allowed: true,
      role: 'admin',
      application,
      profile,
      message: null,
    }
  }

  return {
    allowed: false,
    role: profile.role,
    application,
    message:
      'You do not have permission to access final application files',
  }
}

function isJpeg(mimeType) {
  return (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/jpg'
  )
}

function isPng(mimeType) {
  return mimeType === 'image/png'
}

export async function uploadFinalFile(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
    } = req.params

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          'Application ID is required',
      })
    }

    const access =
      await getApplicationAccess(
        applicationId,
        userId
      )

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          access.message ||
          'Access denied',
      })
    }

    if (
      access.role !== 'operator' &&
      access.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Only operator or admin can upload final application files',
      })
    }

    const files =
      req.files || []

    if (files.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          'Please upload at least 2 screenshots',
      })
    }

    if (files.length > 4) {
      return res.status(400).json({
        success: false,
        message:
          'You can upload maximum 4 screenshots at a time',
      })
    }

    for (const file of files) {
      if (
        !isJpeg(file.mimetype) &&
        !isPng(file.mimetype)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Only JPG and PNG screenshots are allowed',
        })
      }
    }

    const {
      data: previousFiles,
      error: previousError,
    } = await supabase
      .from(
        'application_final_files'
      )
      .select(
        'id, version, is_current, storage_path'
      )
      .eq(
        'application_id',
        applicationId
      )
      .order(
        'version',
        {
          ascending: false,
        }
      )

    if (previousError) {
      console.error(
        'Get previous final files error:',
        previousError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to get previous PDF versions',
        error:
          previousError.message,
      })
    }

    const nextVersion =
      previousFiles?.length
        ? Number(
            previousFiles[0]
              .version || 0
          ) + 1
        : 1

    const pdfDoc =
      await PDFDocument.create()

    for (
      let index = 0;
      index < files.length;
      index += 1
    ) {
      const file =
        files[index]

      let image

      if (
        isJpeg(
          file.mimetype
        )
      ) {
        image =
          await pdfDoc.embedJpg(
            file.buffer
          )
      } else {
        image =
          await pdfDoc.embedPng(
            file.buffer
          )
      }

      const imageWidth =
        image.width

      const imageHeight =
        image.height

      const maxWidth = 595
      const maxHeight = 842

      const scale = Math.min(
        maxWidth /
          imageWidth,
        maxHeight /
          imageHeight
      )

      const pageWidth =
        imageWidth * scale

      const pageHeight =
        imageHeight * scale

      const page =
        pdfDoc.addPage([
          pageWidth,
          pageHeight,
        ])

      page.drawImage(
        image,
        {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        }
      )
    }

    const pdfBytes =
      await pdfDoc.save()

    const applicationNumber =
      access.application
        .application_number ||
      applicationId

    const safeApplicationNumber =
      String(
        applicationNumber
      ).replace(
        /[^a-zA-Z0-9-_]/g,
        '_'
      )

    const fileName =
      `${safeApplicationNumber}-v${nextVersion}.pdf`

    const storagePath =
      `${applicationId}/version-${nextVersion}/${fileName}`

    const {
      error:
        currentUpdateError,
    } = await supabase
      .from(
        'application_final_files'
      )
      .update({
        is_current: false,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'application_id',
        applicationId
      )
      .eq(
        'is_current',
        true
      )

    if (currentUpdateError) {
      console.error(
        'Update previous final file error:',
        currentUpdateError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to update previous PDF version',
        error:
          currentUpdateError.message,
      })
    }

    const {
      error:
        storageError,
    } = await supabase.storage
      .from(
        'application-final-files'
      )
      .upload(
        storagePath,
        pdfBytes,
        {
          contentType:
            'application/pdf',
          upsert: false,
        }
      )

    if (storageError) {
      console.error(
        'Final PDF storage upload error:',
        storageError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to upload generated PDF',
        error:
          storageError.message,
      })
    }

    const {
      data: finalFile,
      error:
        databaseError,
    } = await supabase
      .from(
        'application_final_files'
      )
      .insert({
        application_id:
          applicationId,

        version:
          nextVersion,

        file_name:
          fileName,

        storage_path:
          storagePath,

        mime_type:
          'application/pdf',

        file_size:
          pdfBytes.length,

        screenshot_count:
          files.length,

        uploaded_by:
          userId,

        is_current:
          true,

        updated_at:
          new Date().toISOString(),
      })
      .select()
      .single()

    if (databaseError) {
      console.error(
        'Save final file metadata error:',
        databaseError
      )

      await supabase.storage
        .from(
          'application-final-files'
        )
        .remove([
          storagePath,
        ])

      return res.status(500).json({
        success: false,
        message:
          'Failed to save final PDF information',
        error:
          databaseError.message,
      })
    }

    const {
      data: signedUrlData,
      error:
        signedUrlError,
    } = await supabase.storage
      .from(
        'application-final-files'
      )
      .createSignedUrl(
        storagePath,
        60 * 10
      )

    if (signedUrlError) {
      console.error(
        'Create final PDF signed URL error:',
        signedUrlError
      )
    }

    return res.status(201).json({
      success: true,

      message:
        'Final application PDF generated successfully',

      finalFile,

      pdf: {
        version:
          nextVersion,

        fileName,

        screenshotCount:
          files.length,

        signedUrl:
          signedUrlData?.signedUrl ||
          null,
      },
    })
  } catch (error) {
    console.error(
      'Upload final file error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to generate final application PDF',
      error:
        error.message,
    })
  }
}

export async function getCurrentFinalFile(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
    } = req.params

    const access =
      await getApplicationAccess(
        applicationId,
        userId
      )

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          access.message ||
          'Access denied',
      })
    }

    const {
      data: finalFile,
      error,
    } = await supabase
      .from(
        'application_final_files'
      )
      .select('*')
      .eq(
        'application_id',
        applicationId
      )
      .eq(
        'is_current',
        true
      )
      .maybeSingle()

    if (error) {
      console.error(
        'Get current final file error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch final application PDF',
        error:
          error.message,
      })
    }

    if (!finalFile) {
      return res.status(404).json({
        success: false,
        message:
          'Final application PDF is not available yet',
      })
    }

    const {
      data: signedUrlData,
      error:
        signedUrlError,
    } = await supabase.storage
      .from(
        'application-final-files'
      )
      .createSignedUrl(
        finalFile.storage_path,
        60 * 10
      )

    if (signedUrlError) {
      console.error(
        'Create signed URL error:',
        signedUrlError
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to create PDF access URL',
        error:
          signedUrlError.message,
      })
    }

    return res.status(200).json({
      success: true,

      finalFile,

      pdf: {
        signedUrl:
          signedUrlData.signedUrl,
      },
    })
  } catch (error) {
    console.error(
      'Get current final file error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch final application PDF',
      error:
        error.message,
    })
  }
}

export async function getFinalFileVersions(
  req,
  res
) {
  try {
    const userId =
      getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required',
      })
    }

    const {
      id: applicationId,
    } = req.params

    const access =
      await getApplicationAccess(
        applicationId,
        userId
      )

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          access.message ||
          'Access denied',
      })
    }

    const {
      data: finalFiles,
      error,
    } = await supabase
      .from(
        'application_final_files'
      )
      .select('*')
      .eq(
        'application_id',
        applicationId
      )
      .order(
        'version',
        {
          ascending: false,
        }
      )

    if (error) {
      console.error(
        'Get final file versions error:',
        error
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch PDF versions',
        error:
          error.message,
      })
    }

    return res.status(200).json({
      success: true,

      count:
        finalFiles?.length || 0,

      finalFiles:
        finalFiles || [],
    })
  } catch (error) {
    console.error(
      'Get final file versions error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch PDF versions',
      error:
        error.message,
    })
  }
}