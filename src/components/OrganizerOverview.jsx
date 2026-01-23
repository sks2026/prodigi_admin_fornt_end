import { useState, useEffect } from 'react'
import CompetitionDetailsModal from './CompetitionDetailsModal'
import CreateCompetitionModal from './CreateCompetitionModal'
import AddBankAccountModal from './AddBankAccountModal'
import { API_BASE_URL } from '../config/apiConfig'

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
    const [showBankAccountModal, setShowBankAccountModal] = useState(false)
    const [editCompetitionId, setEditCompetitionId] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportMessage, setReportMessage] = useState({ type: '', text: '' })
    const [sendingRegistrations, setSendingRegistrations] = useState(null) // competitionId being sent

    const handleViewCompetition = (competitionId) => {
        setSelectedCompetitionId(competitionId)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedCompetitionId(null)
    }

    const handleEditCompetition = (competitionId) => {
        setEditCompetitionId(competitionId)
        setShowCreateCompModal(true)
    }

    const handleCloseCreateCompModal = async () => {
        setShowCreateCompModal(false)
        setEditCompetitionId(null)
        
        // Refresh competitions list if we were editing
        if (editCompetitionId && organizerData?._id) {
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
                }
            } catch (err) {
                console.error('Error refreshing competitions:', err)
            }
        }
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

    const handleSendReport = async () => {
        if (!organizerData?._id) {
            alert('Organizer data not available')
            return
        }

        if (!window.confirm('Are you sure you want to send the report via email to the organizer?')) {
            return
        }

        setReportLoading(true)
        setReportMessage({ type: '', text: '' })

        try {
            const response = await fetch(`${API_BASE_URL}/api/organizer-reports/send-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    organizerId: organizerData._id
                })
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setReportMessage({ type: 'success', text: result.message || 'Report sent successfully!' })
                alert(`Report sent successfully to ${result.data?.emailSentTo || organizerData.email || organizerData.organiserEmail}`)
            } else {
                setReportMessage({ type: 'error', text: result.message || 'Failed to send report' })
                alert(result.message || 'Failed to send report. Please try again.')
            }
        } catch (error) {
            console.error('Error sending report:', error)
            setReportMessage({ type: 'error', text: 'Failed to send report. Please try again.' })
            alert('Failed to send report. Please try again.')
        } finally {
            setReportLoading(false)
            // Clear message after 5 seconds
            setTimeout(() => {
                setReportMessage({ type: '', text: '' })
            }, 5000)
        }
    }

    const handleSendRegistrations = async (competition) => {
        const competitionName = competition.overview?.name || 'Competition'
        const registrationCount = competition.registrations?.length || 0

        if (registrationCount === 0) {
            alert('No registrations found for this competition')
            return
        }

        const organizerEmail = organizerData?.email || organizerData?.organiserEmail
        if (!organizerEmail) {
            alert('Organizer email not found')
            return
        }

        if (!window.confirm(`Send registration list (${registrationCount} users) for "${competitionName}" to ${organizerEmail}?`)) {
            return
        }

        setSendingRegistrations(competition._id)

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/competitions/send-registrations-email/${competition._id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        organizerId: organizerData._id,
                        organizerEmail: organizerEmail
                    })
                }
            )

            const data = await response.json()

            if (response.ok && data.success) {
                alert(`Registration list sent successfully to ${organizerEmail}`)
            } else {
                alert(data.message || 'Failed to send registration list')
            }
        } catch (err) {
            console.error('Error sending registrations:', err)
            alert('Failed to send registration list. Please try again.')
        } finally {
            setSendingRegistrations(null)
        }
    }

    const handleDuplicateCompetition = async (competitionId) => {
        if (!window.confirm('Are you sure you want to duplicate this competition? The duplicate will be created with closed status.')) {
            return
        }

        try {
            const response = await fetch(
                `https://api.prodigiedu.com/api/competitions/duplicate/${competitionId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            const data = await response.json()

            if (response.ok && data.success) {
                alert('Competition duplicated successfully!')
                // Refresh the competitions list
                if (organizerData?._id) {
                    const refreshResponse = await fetch(
                        `https://api.prodigiedu.com/api/competitions/getAllByOrganizerId?organizerId=${organizerData._id}`
                    )
                    const refreshData = await refreshResponse.json()
                    if (refreshResponse.ok && refreshData.status) {
                        setCompetitions(refreshData.data.competitions || [])
                        setStats({
                            total: refreshData.data.total || 0,
                            complete: refreshData.data.complete || 0,
                            incomplete: refreshData.data.incomplete || 0
                        })
                    }
                }
            } else {
                alert(data.message || 'Failed to duplicate competition')
            }
        } catch (err) {
            console.error('Error duplicating competition:', err)
            alert('Failed to duplicate competition. Please try again.')
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {organizerData && (
                        <button
                            type="button"
                            onClick={() => setShowBankAccountModal(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                        >
                            + Add Bank Account
                        </button>
                    )}
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
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Competition Name</th>
                                    <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Raised by</th>
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
                                            {comp.overview?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                            {comp.createdBy || organizerData?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendRegistrations(comp)}
                                                    disabled={sendingRegistrations === comp._id}
                                                    title="Send Registrations to Organizer"
                                                    style={{
                                                        padding: '6px 10px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        border: '1px solid #8b5cf6',
                                                        borderRadius: '4px',
                                                        cursor: sendingRegistrations === comp._id ? 'not-allowed' : 'pointer',
                                                        backgroundColor: sendingRegistrations === comp._id ? '#e5e7eb' : '#ede9fe',
                                                        color: sendingRegistrations === comp._id ? '#9ca3af' : '#8b5cf6',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        opacity: sendingRegistrations === comp._id ? 0.7 : 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (sendingRegistrations !== comp._id) {
                                                            e.currentTarget.style.backgroundColor = '#ddd6fe'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (sendingRegistrations !== comp._id) {
                                                            e.currentTarget.style.backgroundColor = '#ede9fe'
                                                        }
                                                    }}
                                                >
                                                    {sendingRegistrations === comp._id ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                                            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"></circle>
                                                        </svg>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                        </svg>
                                                    )}
                                                    <span style={{ fontSize: '11px' }}>
                                                        {comp.registrations?.length || 0}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditCompetition(comp._id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: '1px solid #3b82f6',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#dbeafe',
                                                        color: '#3b82f6',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#bfdbfe'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#dbeafe'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicateCompetition(comp._id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: '1px solid #f59e0b',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#fef3c7',
                                                        color: '#f59e0b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#fde68a'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#fef3c7'
                                                    }}
                                                >
                                                    Duplicate
                                                </button>
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

            </div>

            {reportMessage.text && (
                <div
                    style={{
                        padding: '12px 16px',
                        marginTop: 16,
                        marginBottom: 16,
                        borderRadius: 8,
                        backgroundColor: reportMessage.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: reportMessage.type === 'error' ? '#991b1b' : '#065f46',
                        fontSize: 14,
                        fontWeight: 500
                    }}
                >
                    {reportMessage.text}
                </div>
            )}

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
                    onClick={handleSendReport}
                    disabled={!organizerData?._id || reportLoading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: reportLoading || !organizerData?._id ? '#9ca3af' : '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: reportLoading || !organizerData?._id ? 'not-allowed' : 'pointer',
                        opacity: reportLoading || !organizerData?._id ? 0.6 : 1,
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!reportLoading && organizerData?._id) {
                            e.target.style.backgroundColor = '#15803d'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!reportLoading && organizerData?._id) {
                            e.target.style.backgroundColor = '#16a34a'
                        }
                    }}
                >
                    {reportLoading ? 'Sending...' : 'Send Report'}
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
                onClose={handleCloseCreateCompModal}
                organizerData={organizerData}
                editCompetitionId={editCompetitionId}
            />

            {/* Add Bank Account Modal */}
            {organizerData && (
                <AddBankAccountModal
                    isOpen={showBankAccountModal}
                    onClose={() => setShowBankAccountModal(false)}
                    organizerId={organizerData._id}
                />
            )}
        </div>
    )
}

export default OrganizerOverview



