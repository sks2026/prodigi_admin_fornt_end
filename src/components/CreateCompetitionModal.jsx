import { useState, useEffect } from 'react'
import Oleftsidbar from './Oleftsidbar'
import Orightcontaint from './Orightcontaint'
import OSyllabus from './OSyllabus'
import Opattern from './Opattern'
import Oeligibility from './Oeligibility'
import Oregistration from './Oregistration'
import Oawards from './Oawards'
import './OverviewZero.css'

const CreateCompetitionModal = ({ isOpen, onClose, organizerData, editCompetitionId = null }) => {
    const [page, setPage] = useState(0)
    const [ID, setID] = useState("")

    const sidebarData = (i, competitionId) => {
        setPage(i)
        setID(competitionId)
        console.log("Page changed to:", i, "Competition ID:", competitionId)
    }

    // Initialize with edit competition ID if provided
    useEffect(() => {
        if (isOpen && editCompetitionId) {
            setID(editCompetitionId)
            setPage(0)
        }
    }, [isOpen, editCompetitionId])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPage(0)
            setID("")
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: '#fff',
                width: '95%',
                height: '95%',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#fff'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                        {editCompetitionId ? 'Edit Competition' : 'Create New Competition'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            padding: '0',
                            color: '#666',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Organization Info */}
                {organizerData && (
                    <div style={{
                        padding: '12px 24px',
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            <strong>Organization:</strong> {organizerData.organiserName || organizerData.name}
                        </div>
                    </div>
                )}

                {/* Modal Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden'
                }}>
                    <div className="OverviewZero" style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex'
                    }}>
                        <div className="app-container" style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex'
                        }}>
                            <div className="main-content" style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex'
                            }}>
                                <Oleftsidbar fun={sidebarData} page={page} ID={ID} />

                                <div className="flexgrow" style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollBehavior: 'smooth',
                                    position: 'relative'
                                }}>
                                    {page === 0 && <Orightcontaint fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                    {page === 1 && <OSyllabus fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                    {page === 2 && <Opattern fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                    {page === 3 && <Oeligibility fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                    {page === 4 && <Oregistration fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                    {page === 5 && <Oawards fun={sidebarData} ID={ID} organizerData={organizerData} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateCompetitionModal
