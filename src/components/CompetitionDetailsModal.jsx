import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Oleftsidbar from './Oleftsidbar'
import Orightcontaint from './Orightcontaint'
import OSyllabus from './OSyllabus'
import Opattern from './Opattern'
import Oeligibility from './Oeligibility'
import Oregistration from './Oregistration'
import Oawards from './Oawards'
import './OverviewZero.css'
import './CompetitionDetailsModal.css'

const CompetitionDetailsModal = ({ competitionId, onClose }) => {
    const [page, setPage] = useState(0)

    const sidebarData = (i, Id) => {
        setPage(i)
        console.log('Page:', i, 'ID:', Id || competitionId)
    }

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!competitionId) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
            onClick={(e) => {
                // Close on backdrop click
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            {/* Full Page Modal */}
            <div style={{
                backgroundColor: 'white',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header - Fixed */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    flexShrink: 0
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#1f2937'
                    }}>
                        Competition Details - {competitionId.substring(0, 8)}...
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: '2px solid #e5e7eb',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: 8,
                            transition: 'all 0.2s',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#6b7280'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2'
                            e.currentTarget.style.borderColor = '#ef4444'
                            e.currentTarget.style.color = '#dc2626'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.color = '#6b7280'
                        }}
                    >
                        <X size={18} />
                        Close
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="OverviewZero" style={{
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: '#f9fafb'
                }}>
                    <div className="app-container" style={{ height: '100%' }}>
                        <div className="main-content" style={{
                            display: 'flex',
                            height: '100%',
                            gap: 0
                        }}>
                            <Oleftsidbar
                                fun={sidebarData}
                                page={page}
                                ID={competitionId}
                            />

                            <div className="flexgrow" style={{
                                flex: 1,
                                overflow: 'auto',
                                backgroundColor: 'white'
                            }}>
                                {page === 0 && (
                                    <Orightcontaint
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}

                                {page === 1 && (
                                    <OSyllabus
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}

                                {page === 2 && (
                                    <Opattern
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}

                                {page === 3 && (
                                    <Oeligibility
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}

                                {page === 4 && (
                                    <Oregistration
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}

                                {page === 5 && (
                                    <Oawards
                                        fun={sidebarData}
                                        ID={competitionId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompetitionDetailsModal
