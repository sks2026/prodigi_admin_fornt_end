import { useState, useEffect } from 'react'
import CompetitionDetailsModal from './CompetitionDetailsModal'
import CreateCompetitionModal from './CreateCompetitionModal'

const OrganizerOverview = ({ onShowHistory, organizerData, onCreateRequest }) => {
    const [activeTab, setActiveTab] = useState('requests') // 'requests' or 'competitions'
    const [competitions, setCompetitions] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [requestsLoading, setRequestsLoading] = useState(false)
    const [error, setError] = useState('')
    const [requestsError, setRequestsError] = useState('')
    const [stats, setStats] = useState({ total: 0, complete: 0, incomplete: 0 })
    const [selectedCompetitionId, setSelectedCompetitionId] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showCreateCompModal, setShowCreateCompModal] = useState(false)

    const handleViewCompetition = (competitionId) => {
        setSelectedCompetitionId(competitionId)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedCompetitionId(null)
    }

    const handleToggleStatus = async (competitionId, currentStatus) => {
        const newStatus = !currentStatus
        const confirmMessage = newStatus 
            ? 'Are you sure you want to close this competition?' 
            : 'Are you sure you want to open this competition?'
        
        if (!window.confirm(confirmMessage)) {
            return
        }

        try {
            const response = await fetch(
                `https://api.prodigiedu.com/api/competitions/toggleStatus/${competitionId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            )

            const data = await response.json()

            if (response.ok && data.success) {
                // Update the local state
                setCompetitions(prev =>
                    prev.map(comp =>
                        comp._id === competitionId
                            ? { ...comp, iscomplete: newStatus }
                            : comp
                    )
                )
                alert(data.message)
            } else {
                alert(data.message || 'Failed to update competition status')
            }
        } catch (err) {
            console.error('Error toggling competition status:', err)
            alert('Failed to update competition status. Please try again.')
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    // Get location from address
    const getLocation = () => {
        if (!organizerData?.organiserAddress) return 'N/A'
        const { cityDistrict, country } = organizerData.organiserAddress
        if (cityDistrict && country) return `${cityDistrict}, ${country}`
        return cityDistrict || country || 'N/A'
    }

    // Fetch competitions when organizerData changes
    useEffect(() => {
        const fetchCompetitions = async () => {
            if (!organizerData?._id) {
                setCompetitions([])
                return
            }

            setLoading(true)
            setError('')

            try {
                const response = await fetch(
                    `https://api.prodigiedu.com/api/competitions/getAllByOrganizerId?organizerId=${organizerData._id}`
                )

                const data = await response.json()

                if (response.ok && data.status) {
                    setCompetitions(data.data.competitions || [])
                    setStats({
                        total: data.data.total || 0,
                        complete: data.data.complete || 0,
                        incomplete: data.data.incomplete || 0
                    })
                    setError('')
                } else {
                    setCompetitions([])
                    setError(data.message || 'Failed to fetch competitions')
                }
            } catch (err) {
                setCompetitions([])
                setError('Failed to fetch competitions. Please try again.')
                console.error('Error fetching competitions:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCompetitions()
    }, [organizerData])

    // Fetch requests when organizerData changes
    useEffect(() => {
        const fetchRequests = async () => {
            const customerId = organizerData?.organisationId || organizerData?._id
            if (!customerId) {
                setRequests([])
                return
            }

            setRequestsLoading(true)
            setRequestsError('')

            try {
                const response = await fetch(`https://api.prodigiedu.com/api/customer-requests/my-requests/${customerId}`)
                const result = await response.json()

                if (response.ok && result.success && result.data && Array.isArray(result.data.requests)) {
                    setRequests(result.data.requests)
                    setRequestsError('')
                } else {
                    setRequests([])
                    setRequestsError(result.message || 'Failed to fetch requests')
                }
            } catch (err) {
                setRequests([])
                setRequestsError('Failed to fetch requests. Please try again.')
                console.error('Error fetching requests:', err)
            } finally {
                setRequestsLoading(false)
            }
        }

        fetchRequests()
    }, [organizerData])

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Organiser Overview</h2>
                {organizerData && (
                    <span style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: organizerData.status ? '#e6f7e6' : '#ffe6e6',
                        color: organizerData.status ? 'green' : 'red'
                    }}>
                        {organizerData.status ? 'Active' : 'Inactive'}
                    </span>
                )}
            </div>

            {!organizerData ? (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    textAlign: 'center',
                    color: '#666'
                }}>
                    No organizer data available. Please search for an organizer first.
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 980, marginTop: 16 }}>
                        <div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Organization Name:</strong> {organizerData.organiserName || organizerData.name || 'N/A'}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Location:</strong> {getLocation()}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Account Created On:</strong> {formatDate(organizerData.createdAt)}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Account Status:</strong>
                                <span style={{
                                    marginLeft: 8,
                                    color: organizerData.status ? 'green' : 'red',
                                    fontWeight: 'bold'
                                }}>
                                    {organizerData.status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Admin Name:</strong> {organizerData.name || organizerData.directorName || 'N/A'}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Admin Mobile No.:</strong> {organizerData.mobileNumber || organizerData.organiserMobileNumber || 'N/A'}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Admin Email ID:</strong> {organizerData.email || organizerData.organiserEmail || 'N/A'}
                            </div>
                            <div style={{ margin: '6px 0' }}>
                                <strong>Organizer ID:</strong> {organizerData._id || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* {organizerData.organiserWebsite && (
                        <div style={{ marginTop: 16 }}>
                            <strong>Website:</strong>{' '}
                            <a
                                href={organizerData.organiserWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', textDecoration: 'none' }}
                            >
                                {organizerData.organiserWebsite}
                            </a>
                        </div>
                    )} */}
                </>
            )}

            <div style={{ marginTop: 32, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #e5e7eb',
                    backgroundColor: '#fff'
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('requests')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: activeTab === 'requests' ? '#16a34a' : '#6b7280',
                            borderBottom: activeTab === 'requests' ? '3px solid #16a34a' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Open Requests
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('competitions')}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: activeTab === 'competitions' ? '#16a34a' : '#6b7280',
                            borderBottom: activeTab === 'competitions' ? '3px solid #16a34a' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Competitions
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'requests' ? (
                    /* Open Requests Table */
                    requestsLoading ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            Loading requests...
                        </div>
                    ) : requestsError ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#dc2626',
                            backgroundColor: '#fee2e2'
                        }}>
                            {requestsError}
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            No requests found for this organizer
                        </div>
                    ) : (
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Reference ID</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Customer Name</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Request</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Raised by</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request._id}>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>
                                            {request.referenceId || request._id?.substring(0, 12) || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {request.customerName || organizerData?.organiserName || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {request.request || request.requestType || request.type || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {request.raisedBy || request.createdBy || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {(() => {
                                                const s = (request.status || '').toString()
                                                const sl = s.toLowerCase()
                                                const bg = sl === 'open' || sl === 'in progress' ? '#fef3c7' : sl === 'closed' ? '#d1fae5' : '#f3f4f6'
                                                const color = sl === 'open' || sl === 'in progress' ? '#d97706' : sl === 'closed' ? '#059669' : '#6b7280'
                                                const borderColor = sl === 'open' || sl === 'in progress' ? '#fcd34d' : sl === 'closed' ? '#6ee7b7' : '#e5e7eb'
                                                const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Open'
                                                return (
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        backgroundColor: bg,
                                                        color,
                                                        border: '1px solid',
                                                        borderColor
                                                    }}>
                                                        {label}
                                                    </span>
                                                )
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    /* Competitions Table */
                    loading ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            Loading competitions...
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#dc2626',
                            backgroundColor: '#fee2e2'
                        }}>
                            {error}
                        </div>
                    ) : competitions.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            No competitions found for this organizer
                        </div>
                    ) : (
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Reference ID</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Customer Name</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Request</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Raised by</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Status</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitions.map((comp) => (
                                    <tr key={comp._id}>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>
                                            {comp.referenceId || comp._id?.substring(0, 12) || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {organizerData?.organiserName || organizerData?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            Create Competition
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {comp.createdBy || organizerData?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor:
                                                    comp.status === 'Open' ? '#fef3c7' :
                                                        comp.status === 'In progress' ? '#fef3c7' :
                                                            comp.status === 'Closed' ? '#d1fae5' : '#fef3c7',
                                                color:
                                                    comp.status === 'Open' ? '#d97706' :
                                                        comp.status === 'In progress' ? '#d97706' :
                                                            comp.status === 'Closed' ? '#059669' : '#d97706',
                                                border: '1px solid',
                                                borderColor:
                                                    comp.status === 'Open' ? '#fcd34d' :
                                                        comp.status === 'In progress' ? '#fcd34d' :
                                                            comp.status === 'Closed' ? '#6ee7b7' : '#fcd34d'
                                            }}>
                                                {comp.status || (comp.iscomplete ? 'Closed' : 'Open')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(comp._id, comp.iscomplete)}
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    border: '1px solid',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    backgroundColor: comp.iscomplete ? '#dcfce7' : '#fee2e2',
                                                    color: comp.iscomplete ? '#16a34a' : '#dc2626',
                                                    borderColor: comp.iscomplete ? '#16a34a' : '#dc2626',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = comp.iscomplete ? '#bbf7d0' : '#fecaca'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = comp.iscomplete ? '#dcfce7' : '#fee2e2'
                                                }}
                                            >
                                                {comp.iscomplete ? 'Open' : 'Close'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                    type="button"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onClick={() => onCreateRequest && onCreateRequest(organizerData)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                    Create New Request
                </button>
                <button
                    type="button"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                    Send Report
                </button>
                <button
                    type="button"
                    onClick={() => setShowCreateCompModal(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                    Create Competition
                </button>
            </div>

            {/* Competition Details Modal */}
            {showModal && selectedCompetitionId && (
                <CompetitionDetailsModal
                    competitionId={selectedCompetitionId}
                    onClose={handleCloseModal}
                />
            )}

            {/* Create Competition Modal */}
            <CreateCompetitionModal
                isOpen={showCreateCompModal}
                onClose={() => setShowCreateCompModal(false)}
                organizerData={organizerData}
            />
        </div>
    )
}

export default OrganizerOverview



