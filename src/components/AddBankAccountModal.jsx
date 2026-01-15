import { useState } from 'react'

const AddBankAccountModal = ({ isOpen, onClose, organizerId }) => {
    const [formData, setFormData] = useState({
        accountNumber: '',
        ifsc: '',
        accountType: 'savings'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.accountNumber || !formData.ifsc) {
            setError('Please fill all required fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `http://localhost:3001/api/competitions/bankaccount/${organizerId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accountNumber: formData.accountNumber,
                        ifsc: formData.ifsc,
                        accountType: formData.accountType
                    })
                }
            )

            const data = await response.json()

            if (response.ok && data.success) {
                alert('Bank account added successfully!')
                setFormData({
                    accountNumber: '',
                    ifsc: '',
                    accountType: 'savings'
                })
                onClose()
            } else {
                setError(data.message || 'Failed to add bank account')
            }
        } catch (err) {
            console.error('Error adding bank account:', err)
            setError('Failed to add bank account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: '24px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Add Bank Account</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: 4,
                        marginBottom: 16
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Account Number <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 4,
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter account number"
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            IFSC Code <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="ifsc"
                            value={formData.ifsc}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 4,
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                textTransform: 'uppercase'
                            }}
                            placeholder="Enter IFSC code"
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            fontSize: '14px'
                        }}>
                            Account Type <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 4,
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="savings">Savings</option>
                            <option value="current">Current</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#9ca3af' : '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Adding...' : 'Add Bank Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddBankAccountModal
