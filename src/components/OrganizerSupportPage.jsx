import { useMemo, useState } from 'react'
import OrganizerForm from './OrganizerForm'
import OrganizerOverview from './OrganizerOverview'
import OrganizerHistory from './OrganizerHistory'

const OrganizerSupportPage = ({ onCreateRequest }) => {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ organiserId: '' })
    const [organizerData, setOrganizerData] = useState(null)

    const isFormValid = useMemo(() => {
        return form.organiserId
    }, [form])

    const handleVerify = (data) => {
        setOrganizerData(data)
        setStep(2)
    }

    return (
        <div style={{ padding: 24 }}>
            {step === 1 && (
                <OrganizerForm
                    form={form}
                    setForm={setForm}
                    isFormValid={isFormValid}
                    onVerify={handleVerify}
                />
            )}

            {step === 2 && (
                <OrganizerOverview
                    organizerData={organizerData}
                    onShowHistory={() => setStep(3)}
                    onCreateRequest={onCreateRequest}
                />
            )}

            {step === 3 && (
                <OrganizerHistory onBack={() => setStep(2)} />
            )}
        </div>
    )
}

export default OrganizerSupportPage

