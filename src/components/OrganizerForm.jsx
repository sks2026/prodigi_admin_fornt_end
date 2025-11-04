import { useState } from 'react'

const OrganizerForm = ({ form, setForm, onVerify }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [organizerData, setOrganizerData] = useState(null)

    const handleSearch = async () => {
        if (!form.organiserId) {
            setError('Please enter email or mobile number')
            return
        }

        setLoading(true)
        setError('')
        setOrganizerData(null)

        try {
            // Determine if input is email or mobile number
            const isEmail = form.organiserId.includes('@')
            const searchParam = isEmail
                ? `email=${encodeURIComponent(form.organiserId)}`
                : `mobileNumber=${encodeURIComponent(form.organiserId)}`

            const response = await fetch(
                `http://localhost:3001/api/organisations/search?${searchParam}`
            )

            const data = await response.json()

            if (response.ok && data.status) {
                setOrganizerData(data.data)
                setError('')
            } else {
                setError(data.message || 'Organisation not found')
                setOrganizerData(null)
            }
        } catch (err) {
            setError('Failed to fetch organizer data. Please try again.')
            setOrganizerData(null)
            console.error('Error fetching organizer:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleContinue = () => {
        if (organizerData) {
            onVerify(organizerData)
        }
    }

    return (
        <div>
            <h2>Enter Customer Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 840, marginTop: 24 }}>
                <div>
                    <label>Organiser Email or Mobile Number</label>
                    <input
                        type="text"
                        placeholder="Enter Email or Mobile Number"
                        value={form.organiserId}
                        onChange={(e) => {
                            setForm({ ...form, organiserId: e.target.value })
                            setError('')
                            setOrganizerData(null)
                        }}
                        className="input"
                        disabled={loading}
                    />
                    {error && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                            {error}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'end', gap: 12 }}>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!form.organiserId || loading}
                        onClick={handleSearch}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>

                    {organizerData && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>

            {organizerData && (
                <div style={{
                    marginTop: 24,
                    padding: 20,
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, color: '#2c5282' }}>Organizer Details</h3>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: 4,
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: organizerData.status ? '#e6f7e6' : '#ffe6e6',
                            color: organizerData.status ? 'green' : 'red'
                        }}>
                            {organizerData.status ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {!organizerData.status && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffecb5',
                            borderRadius: 4,
                            marginBottom: 16,
                            color: '#856404'
                        }}>
                            ⚠️ Warning: This organization is currently inactive
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <strong>Organizer ID:</strong> {organizerData._id || 'N/A'}
                        </div>
                        <div>
                            <strong>Name:</strong> {organizerData.name || 'N/A'}
                        </div>
                        <div>
                            <strong>Email:</strong> {organizerData.email || 'N/A'}
                        </div>
                        <div>
                            <strong>Mobile:</strong> {organizerData.mobileNumber || 'N/A'}
                        </div>
                        <div>
                            <strong>Role:</strong> {organizerData.role || 'N/A'}
                        </div>
                        <div>
                            <strong>Google User:</strong> {organizerData.isGoogleUser ? 'Yes' : 'No'}
                        </div>
                    </div>

                    {(organizerData.organiserName || organizerData.organiserEmail || organizerData.organiserMobileNumber) && (
                        <>
                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                            <h4 style={{ marginBottom: 12, color: '#2c5282' }}>Organisation Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <strong>Organisation Name:</strong> {organizerData.organiserName || 'N/A'}
                                </div>
                                <div>
                                    <strong>Organisation Email:</strong> {organizerData.organiserEmail || 'N/A'}
                                </div>
                                <div>
                                    <strong>Organisation Mobile:</strong> {organizerData.organiserMobileNumber || 'N/A'}
                                </div>
                                <div>
                                    {/* <strong>Website:</strong> {organizerData.organiserWebsite || 'N/A'} */}
                                </div>
                            </div>
                        </>
                    )}

                    {organizerData.organiserAddress && (
                        <>
                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                            <h4 style={{ marginBottom: 12, color: '#2c5282' }}>Address</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {organizerData.organiserAddress.addressLine1 && (
                                    <div>
                                        <strong>Address Line 1:</strong> {organizerData.organiserAddress.addressLine1}
                                    </div>
                                )}
                                {organizerData.organiserAddress.addressLine2 && (
                                    <div>
                                        <strong>Address Line 2:</strong> {organizerData.organiserAddress.addressLine2}
                                    </div>
                                )}
                                {organizerData.organiserAddress.cityDistrict && (
                                    <div>
                                        <strong>City/District:</strong> {organizerData.organiserAddress.cityDistrict}
                                    </div>
                                )}
                                {organizerData.organiserAddress.pincode && (
                                    <div>
                                        <strong>Pincode:</strong> {organizerData.organiserAddress.pincode}
                                    </div>
                                )}
                                <div>
                                    <strong>Country:</strong> {organizerData.organiserAddress.country || 'India'}
                                </div>
                            </div>
                        </>
                    )}

                    {(organizerData.directorName || organizerData.directorMobileNumber) && (
                        <>
                            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                            <h4 style={{ marginBottom: 12, color: '#2c5282' }}>Director Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <strong>Director Name:</strong> {organizerData.directorName || 'N/A'}
                                </div>
                                <div>
                                    <strong>Director Mobile:</strong> {organizerData.directorMobileNumber || 'N/A'}
                                </div>
                            </div>
                        </>
                    )}

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                    <h4 style={{ marginBottom: 12, color: '#2c5282' }}>Verification Status</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <strong>Email Verified:</strong>
                            <span style={{ marginLeft: 8, color: organizerData.emailOtpVerificationStatus ? 'green' : 'red' }}>
                                {organizerData.emailOtpVerificationStatus ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        <div>
                            <strong>Mobile Verified:</strong>
                            <span style={{ marginLeft: 8, color: organizerData.mobileOtpVerificationStatus ? 'green' : 'red' }}>
                                {organizerData.mobileOtpVerificationStatus ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        <div>
                            <strong>Registration Date:</strong> {organizerData.createdAt ? new Date(organizerData.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrganizerForm



