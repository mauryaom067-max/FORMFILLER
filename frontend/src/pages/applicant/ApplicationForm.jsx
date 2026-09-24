import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApplicantShell } from '../../components/layout/ApplicantShell'
import {
  Card,
  Button,
  ProgressSteps,
  Input,
  SectionLabel,
} from '../../components/ui'

import { extractedFields } from '../../lib/mockData'

const STEPS = [
  'Documents',
  'Application',
  'Payment',
  'Processing',
  'Review',
  'Submitted',
]

/*
|--------------------------------------------------------------------------
| Reusable Field
|--------------------------------------------------------------------------
*/

function FormField({ field, value, onChange }) {
  const currentValue =
    value !== undefined ? value : field.value || ''

  return (
    <Input
      label={field.label}
      value={currentValue}
      locked={field.locked}
      onChange={(e) => {
        if (!field.locked) {
          onChange?.(e.target.value)
        }
      }}
      hint={
        field.source
          ? `Imported from ${field.source}`
          : 'Not available in uploaded documents — enter manually'
      }
    />
  )
}

/*
|--------------------------------------------------------------------------
| Select Field
|--------------------------------------------------------------------------
*/

function SelectField({
  label,
  value,
  onChange,
  options = [],
  hint,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      {hint && (
        <p className="text-xs text-ink-faint mt-1.5">
          {hint}
        </p>
      )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Radio / Yes No
|--------------------------------------------------------------------------
*/

function RadioField({
  label,
  value,
  onChange,
  options = ['Yes', 'No'],
  hint,
}) {
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">
        {label}
      </p>

      <div className="flex gap-3 flex-wrap">
        {options.map((option) => {
          const active = value === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`
                px-4 py-2.5 rounded-lg border text-sm transition
                ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-line bg-white text-ink-soft hover:border-brand-300'
                }
              `}
            >
              {option}
            </button>
          )
        })}
      </div>

      {hint && (
        <p className="text-xs text-ink-faint mt-1.5">
          {hint}
        </p>
      )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Section Wrapper
|--------------------------------------------------------------------------
*/

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <Card className="mb-5">
      <SectionLabel>
        {title}
      </SectionLabel>

      {description && (
        <p className="text-xs text-ink-faint mb-6">
          {description}
        </p>
      )}

      {children}
    </Card>
  )
}

/*
|--------------------------------------------------------------------------
| Imported Field
|--------------------------------------------------------------------------
*/

function ImportedField({
  field,
  formData,
  setFormData,
}) {
  return (
    <FormField
      field={field}
      value={formData[field.key]}
      onChange={(value) =>
        setFormData((prev) => ({
          ...prev,
          [field.key]: value,
        }))
      }
    />
  )
}

/*
|--------------------------------------------------------------------------
| Application Form
|--------------------------------------------------------------------------
*/

export default function ApplicationForm() {
  const navigate = useNavigate()

  /*
   * Convert mock data into actual form state.
   *
   * This means the values shown on screen are now
   * also maintained inside ApplicationForm state.
   */

  const initialData = useMemo(() => {
    const allFields = [
      ...extractedFields.personal,
      ...extractedFields.disability,
      ...extractedFields.parent,
      ...extractedFields.examination,
      ...extractedFields.education10,
      ...extractedFields.education12,
      ...extractedFields.address,
      ...extractedFields.additional,
    ]

    return Object.fromEntries(
      allFields.map((field) => [
        field.key,
        field.value || '',
      ])
    )
  }, [])

  const [formData, setFormData] = useState(initialData)

  /*
   * Update any field.
   */

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  /*
   * Category determines whether caste certificate
   * related information is relevant.
   */

  const isReservedCategory = [
    'SC',
    'ST',
    'OBC',
  ].includes(formData.category)

  return (
    <ApplicantShell
      title="JEE Main"
      subtitle="Step 2 of 6 · Application"
    >
      <div className="max-w-content">

        {/* --------------------------------------------------
            Progress
        -------------------------------------------------- */}

        <ProgressSteps
          steps={STEPS}
          current={1}
        />

        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <div className="mt-8 mb-6">

          <h2 className="font-display text-2xl font-bold text-ink">
            Application details
          </h2>

          <p className="text-ink-faint text-sm mt-1">
            We use your uploaded documents to fill available
            information automatically. Any information not found
            in your documents can be entered manually.
          </p>

        </div>

        {/* --------------------------------------------------
            Smart filling information
        -------------------------------------------------- */}

        <Card className="mb-5 bg-brand-50/50 border-brand-100">

          <div className="flex items-start gap-3">

            <div className="w-9 h-9 rounded-lg bg-white border border-brand-200 flex items-center justify-center shrink-0">
              <span className="text-brand-600 font-semibold">
                ✓
              </span>
            </div>

            <div>

              <p className="text-sm font-medium text-ink">
                Smart document-assisted filling
              </p>

              <p className="text-xs text-ink-faint mt-1">
                Verified information from your documents is
                automatically filled and protected from editing.
                Missing information remains editable.
              </p>

            </div>

          </div>

        </Card>

        {/* ==================================================
            1. PERSONAL DETAILS
        ================================================== */}

        <FormSection
          title="1. Personal Details"
          description="Information available from your identity and uploaded documents."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.personal
              .slice(0, 6)
              .map((field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              ))}

          </div>

          <div className="h-px bg-line my-7" />

          <p className="text-sm font-medium text-ink mb-4">
            Category & certificate details
          </p>

          <div className="grid sm:grid-cols-2 gap-5">

            <SelectField
              label="Category"
              value={formData.category}
              onChange={(value) =>
                updateField('category', value)
              }
              options={[
                'General',
                'EWS',
                'OBC',
                'SC',
                'ST',
              ]}
              hint="Select the category applicable to you."
            />

            <SelectField
              label="Valid Category Certificate Available"
              value={formData.categoryCertificate}
              onChange={(value) =>
                updateField(
                  'categoryCertificate',
                  value
                )
              }
              options={[
                'Yes',
                'No',
                'Not Applicable',
              ]}
            />

            {isReservedCategory && (
              <>
                <FormField
                  field={
                    extractedFields.personal.find(
                      (f) =>
                        f.key ===
                        'certificateNumber'
                    )
                  }
                  value={
                    formData.certificateNumber
                  }
                  onChange={(value) =>
                    updateField(
                      'certificateNumber',
                      value
                    )
                  }
                />

                <FormField
                  field={
                    extractedFields.personal.find(
                      (f) =>
                        f.key ===
                        'certificateAuthority'
                    )
                  }
                  value={
                    formData.certificateAuthority
                  }
                  onChange={(value) =>
                    updateField(
                      'certificateAuthority',
                      value
                    )
                  }
                />

                <FormField
                  field={
                    extractedFields.personal.find(
                      (f) =>
                        f.key ===
                        'certificateIssueDate'
                    )
                  }
                  value={
                    formData.certificateIssueDate
                  }
                  onChange={(value) =>
                    updateField(
                      'certificateIssueDate',
                      value
                    )
                  }
                />
              </>
            )}

            <FormField
              field={
                extractedFields.personal.find(
                  (f) =>
                    f.key ===
                    'placeOfBirth'
                )
              }
              value={formData.placeOfBirth}
              onChange={(value) =>
                updateField(
                  'placeOfBirth',
                  value
                )
              }
            />

            <FormField
              field={
                extractedFields.personal.find(
                  (f) =>
                    f.key ===
                    'annualFamilyIncome'
                )
              }
              value={
                formData.annualFamilyIncome
              }
              onChange={(value) =>
                updateField(
                  'annualFamilyIncome',
                  value
                )
              }
            />

            <FormField
              field={
                extractedFields.personal.find(
                  (f) =>
                    f.key === 'medium'
                )
              }
              value={formData.medium}
              onChange={(value) =>
                updateField(
                  'medium',
                  value
                )
              }
            />

            <FormField
              field={
                extractedFields.personal.find(
                  (f) =>
                    f.key ===
                    'identificationNumber'
                )
              }
              value={
                formData.identificationNumber
              }
              onChange={(value) =>
                updateField(
                  'identificationNumber',
                  value
                )
              }
            />

          </div>

        </FormSection>


        {/* ==================================================
            2. DISABILITY
        ================================================== */}

        <FormSection
          title="2. Disability Details"
          description="Complete these details only if applicable."
        >

          <div className="space-y-5">

            <RadioField
              label="Are you a PwD / PwBD candidate?"
              value={formData.pwbd}
              onChange={(value) =>
                updateField('pwbd', value)
              }
            />

            {formData.pwbd === 'Yes' && (
              <div className="grid sm:grid-cols-2 gap-5">

                <FormField
                  field={
                    extractedFields.disability.find(
                      (f) =>
                        f.key ===
                        'disabilityType'
                    )
                  }
                  value={
                    formData.disabilityType
                  }
                  onChange={(value) =>
                    updateField(
                      'disabilityType',
                      value
                    )
                  }
                />

                <FormField
                  field={
                    extractedFields.disability.find(
                      (f) =>
                        f.key ===
                        'disabilityPercentage'
                    )
                  }
                  value={
                    formData.disabilityPercentage
                  }
                  onChange={(value) =>
                    updateField(
                      'disabilityPercentage',
                      value
                    )
                  }
                />

                <FormField
                  field={
                    extractedFields.disability.find(
                      (f) =>
                        f.key ===
                        'udidNumber'
                    )
                  }
                  value={formData.udidNumber}
                  onChange={(value) =>
                    updateField(
                      'udidNumber',
                      value
                    )
                  }
                />

              </div>
            )}

          </div>

        </FormSection>


        {/* ==================================================
            3. PARENT / GUARDIAN
        ================================================== */}

        <FormSection
          title="3. Parent / Guardian Details"
          description="Enter details that are not available in your uploaded documents."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.parent.map(
              (field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            )}

          </div>

        </FormSection>


        {/* ==================================================
            4. EXAMINATION DETAILS
        ================================================== */}

        <FormSection
          title="4. Examination Details"
          description="Choose the examination paper, medium, eligibility state and preferred cities."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            <SelectField
              label="Paper Applied For"
              value={formData.paper}
              onChange={(value) =>
                updateField(
                  'paper',
                  value
                )
              }
              options={[
                'Paper 1 (B.E./B.Tech.)',
                'Paper 2A (B.Arch.)',
                'Paper 2B (B.Planning.)',
                'Paper 2A & 2B',
              ]}
            />

            <SelectField
              label="Question Paper Medium"
              value={
                formData.questionPaperMedium
              }
              onChange={(value) =>
                updateField(
                  'questionPaperMedium',
                  value
                )
              }
              options={[
                'English',
                'Hindi',
                'Assamese',
                'Bengali',
                'Gujarati',
                'Kannada',
                'Malayalam',
                'Marathi',
                'Odia',
                'Punjabi',
                'Tamil',
                'Telugu',
                'Urdu',
              ]}
            />

            <SelectField
              label="Session"
              value={formData.session}
              onChange={(value) =>
                updateField(
                  'session',
                  value
                )
              }
              options={[
                'Session 1',
                'Session 2',
              ]}
            />

            <SelectField
              label="State of Eligibility"
              value={
                formData.stateOfEligibility
              }
              onChange={(value) =>
                updateField(
                  'stateOfEligibility',
                  value
                )
              }
              options={[
                'Uttar Pradesh',
                'Delhi',
                'Bihar',
                'Madhya Pradesh',
                'Rajasthan',
                'Haryana',
                'Other',
              ]}
            />

          </div>

          <div className="h-px bg-line my-7" />

          <p className="text-sm font-medium text-ink mb-4">
            Examination City Preferences
          </p>

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.examination
              .filter((field) =>
                field.key.startsWith(
                  'examCity'
                )
              )
              .map((field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              ))}

          </div>

        </FormSection>


        {/* ==================================================
            5. CLASS 10
        ================================================== */}

        <FormSection
          title="5. Class 10 Education Details"
          description="Information available from the Class 10 marksheet is automatically imported."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.education10.map(
              (field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            )}

          </div>

        </FormSection>


        {/* ==================================================
            6. CLASS 12
        ================================================== */}

        <FormSection
          title="6. Class 12 Education Details"
          description="If your Class 12 marksheet is uploaded, available information can be imported automatically."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.education12.map(
              (field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            )}

          </div>

        </FormSection>


        {/* ==================================================
            7. PRESENT ADDRESS
        ================================================== */}

        <FormSection
          title="7. Present Address & Contact"
          description="Address information may be imported from your Aadhaar or another verified document."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.address.map(
              (field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            )}

          </div>

        </FormSection>


        {/* ==================================================
            8. ADDITIONAL DETAILS
        ================================================== */}

        <FormSection
          title="8. Additional Details"
          description="These details are requested when they cannot be obtained from your uploaded documents."
        >

          <div className="grid sm:grid-cols-2 gap-5">

            {extractedFields.additional.map(
              (field) => (
                <ImportedField
                  key={field.key}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              )
            )}

          </div>

        </FormSection>


        {/* ==================================================
            REVIEW NOTICE
        ================================================== */}

        <Card className="mb-5">

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <span className="text-green-600">
                ✓
              </span>
            </div>

            <div>

              <p className="text-sm font-medium text-ink">
                Your application information is ready
              </p>

              <p className="text-xs text-ink-faint mt-1">
                Before continuing, review the information
                carefully. Verified document-derived fields
                cannot be edited here.
              </p>

            </div>

          </div>

        </Card>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="flex justify-between mt-8 pb-10">

          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                '/forms/jee-main/documents'
              )
            }
          >
            Back
          </Button>

          <Button
            size="lg"
            onClick={() =>
              navigate(
                '/forms/jee-main/payment'
              )
            }
          >
            Review & Continue
          </Button>

        </div>

      </div>
    </ApplicantShell>
  )
}