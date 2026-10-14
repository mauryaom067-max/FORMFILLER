import { supabase } from '../config/supabase.js'

// =====================================================
// 1. UPLOAD DOCUMENT
// =====================================================

export async function uploadDocument(req, res) {
  try {
    // Get logged-in user
    const userId = req.user.id

    // Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      })
    }

    const file = req.file

    // Get document information
    const {
      documentType,
      source = 'upload',
    } = req.body

    // Document type is required
    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required',
      })
    }

    // Validate source
    if (!['upload', 'vault'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document source',
      })
    }

    // -----------------------------------------------
    // Create file extension
    // -----------------------------------------------

    const fileExtension =
      file.originalname.includes('.')
        ? file.originalname
            .split('.')
            .pop()
            .toLowerCase()
        : ''

    // -----------------------------------------------
    // Create unique filename
    // -----------------------------------------------

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}` +
      (fileExtension
        ? `.${fileExtension}`
        : '')

    // -----------------------------------------------
    // User-specific storage path
    // -----------------------------------------------

    const storagePath =
      `${userId}/${fileName}`

    // -----------------------------------------------
    // Upload file to Supabase Storage
    // -----------------------------------------------

    const {
      error: uploadError,
    } = await supabase.storage
      .from('documents')
      .upload(
        storagePath,
        file.buffer,
        {
          contentType: file.mimetype,
          upsert: false,
        }
      )

    // Storage upload failed
    if (uploadError) {
      console.error(
        'Storage upload error:',
        uploadError
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: uploadError.message,
      })
    }

    // -----------------------------------------------
    // Save document metadata in database
    // -----------------------------------------------

    const {
      data,
      error: databaseError,
    } = await supabase
      .from('documents')
      .insert({
        profile_id: userId,
        document_type: documentType,
        document_name: file.originalname,
        storage_path: storagePath,
        file_url: null,
        mime_type: file.mimetype,
        file_size: file.size,
        source,
        verification_status: 'pending',
      })
      .select()
      .single()

    // -----------------------------------------------
    // Rollback storage if database fails
    // -----------------------------------------------

    if (databaseError) {
      console.error(
        'Document database error:',
        databaseError
      )

      await supabase.storage
        .from('documents')
        .remove([storagePath])

      return res.status(500).json({
        success: false,
        message:
          'Document uploaded but metadata could not be saved',
        error: databaseError.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: data,
    })
  } catch (error) {
    console.error(
      'Upload document error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to upload document',
      error: error.message,
    })
  }
}


// =====================================================
// 2. GET MY DOCUMENTS
// =====================================================

export async function getMyDocuments(req, res) {
  try {
    // Get logged-in user
    const userId = req.user.id

    // -----------------------------------------------
    // Get only current user's documents
    // -----------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from('documents')
      .select('*')
      .eq('profile_id', userId)
      .order('uploaded_at', {
        ascending: false,
      })

    // Database error
    if (error) {
      console.error(
        'Get documents error:',
        error
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch documents',
        error: error.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      count: data.length,
      documents: data,
    })
  } catch (error) {
    console.error(
      'Get my documents error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch documents',
      error: error.message,
    })
  }
}


// =====================================================
// 3. GET SECURE DOCUMENT URL
// =====================================================

export async function getDocumentUrl(req, res) {
  try {
    // Get logged-in user
    const userId = req.user.id

    // Get document ID
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      })
    }

    // -----------------------------------------------
    // Find document belonging to current user
    // -----------------------------------------------

    const {
      data: document,
      error: documentError,
    } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('profile_id', userId)
      .single()

    // Document not found
    if (documentError || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      })
    }

    // -----------------------------------------------
    // Generate signed URL
    // Valid for 10 minutes
    // -----------------------------------------------

    const {
      data: signedUrlData,
      error: signedUrlError,
    } = await supabase.storage
      .from('documents')
      .createSignedUrl(
        document.storage_path,
        60 * 10
      )

    // Signed URL error
    if (signedUrlError) {
      console.error(
        'Signed URL error:',
        signedUrlError
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to generate document URL',
        error: signedUrlError.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Secure document URL generated',

      url: signedUrlData.signedUrl,

      // 600 seconds = 10 minutes
      expiresIn: 600,

      document: {
        id: document.id,
        document_name: document.document_name,
        document_type: document.document_type,
        mime_type: document.mime_type,
      },
    })
  } catch (error) {
    console.error(
      'Get document URL error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to generate document URL',
      error: error.message,
    })
  }
}


// =====================================================
// 4. DELETE DOCUMENT
// =====================================================

export async function deleteDocument(req, res) {
  try {
    // Get logged-in user
    const userId = req.user.id

    // Get document ID
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      })
    }

    // -----------------------------------------------
    // Find document belonging to current user
    // -----------------------------------------------

    const {
      data: document,
      error: documentError,
    } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('profile_id', userId)
      .single()

    // Document not found
    if (documentError || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      })
    }

    // -----------------------------------------------
    // Delete actual file from Supabase Storage
    // -----------------------------------------------

    const {
      error: storageError,
    } = await supabase.storage
      .from('documents')
      .remove([
        document.storage_path,
      ])

    // Storage deletion failed
    if (storageError) {
      console.error(
        'Storage delete error:',
        storageError
      )

      return res.status(500).json({
        success: false,
        message: 'Failed to delete document file',
        error: storageError.message,
      })
    }

    // -----------------------------------------------
    // Delete metadata from database
    // -----------------------------------------------

    const {
      error: databaseError,
    } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('profile_id', userId)

    // Database deletion failed
    if (databaseError) {
      console.error(
        'Database delete error:',
        databaseError
      )

      return res.status(500).json({
        success: false,
        message:
          'File deleted but document metadata could not be deleted',
        error: databaseError.message,
      })
    }

    // -----------------------------------------------
    // Success
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      documentId: id,
    })
  } catch (error) {
    console.error(
      'Delete document error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Unable to delete document',
      error: error.message,
    })
  }
}