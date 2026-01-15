import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/apiConfig'

const DataManagementPage = () => {
    const [activeTab, setActiveTab] = useState('download')
    const [reportType, setReportType] = useState('')
    const [duration, setDuration] = useState('')
    const [uploadType, setUploadType] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadedData, setUploadedData] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [dataLoading, setDataLoading] = useState(false)
    const [eligibilitySelectedFile, setEligibilitySelectedFile] = useState(null)
    const [eligibilityUploadLoading, setEligibilityUploadLoading] = useState(false)
    const [eligibilityUploadedData, setEligibilityUploadedData] = useState(null)
    const [eligibilityUploadedFiles, setEligibilityUploadedFiles] = useState([])
    const [eligibilityDataLoading, setEligibilityDataLoading] = useState(false)
    const [patternSelectedFile, setPatternSelectedFile] = useState(null)
    const [patternUploadLoading, setPatternUploadLoading] = useState(false)
    const [patternUploadedData, setPatternUploadedData] = useState(null)
    const [patternUploadedFiles, setPatternUploadedFiles] = useState([])
    const [patternDataLoading, setPatternDataLoading] = useState(false)
    const [awardSelectedFile, setAwardSelectedFile] = useState(null)
    const [awardUploadLoading, setAwardUploadLoading] = useState(false)
    const [awardUploadedData, setAwardUploadedData] = useState(null)
    const [awardUploadedFiles, setAwardUploadedFiles] = useState([])
    const [awardDataLoading, setAwardDataLoading] = useState(false)

    const brandGreen = '#22c55e'
    const textPrimary = '#1f2937'
    const textMuted = '#64748b'
    const borderColor = '#d1d5db'

    const selectBaseStyle = {
        width: 320,
        padding: '10px 12px',
        paddingRight: 40,
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundColor: '#ffffff',
        color: textPrimary,
        fontSize: 14
    }

    const LabeledSelect = ({ label, value, onChange, children }) => (
        <div style={{ position: 'relative', width: 320 }}>
            <label style={{ display: 'block', color: textMuted, fontSize: 12, marginBottom: 6 }}>{label}</label>
            <select value={value} onChange={onChange} style={selectBaseStyle}>
                {children}
            </select>
            <svg
                aria-hidden
                viewBox="0 0 20 20"
                width="18"
                height="18"
                style={{ position: 'absolute', right: 12, top: 34, pointerEvents: 'none', fill: '#374151' }}
            >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.116l3.71-2.885a.75.75 0 11.92 1.178l-4.2 3.266a.75.75 0 01-.92 0l-4.2-3.266a.75.75 0 01-.02-1.06z" />
            </svg>
        </div>
    )

    // Map report types to API endpoints
    const getReportEndpoint = (type) => {
        const endpoints = {
            'payments': '/api/reports/download-payments',
            'registered-students': '/api/reports/download-registered-students',
            'registered-organisers': '/api/reports/download-registered-organisers',
            'competitions': '/api/reports/download-competitions',
            'registrations': '/api/reports/download-registrations'
        }
        return endpoints[type] || null
    }

    // Handle report download
    const handleDownloadReport = async () => {
        if (!reportType || !duration) {
            setMessage({ type: 'error', text: 'Please select both Report Type and Duration' })
            return
        }

        const endpoint = getReportEndpoint(reportType)
        if (!endpoint) {
            setMessage({ type: 'error', text: 'Invalid report type selected' })
            return
        }

        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const url = `${API_BASE_URL}${endpoint}?duration=${duration}`
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to download report' }))
                throw new Error(errorData.message || 'Failed to download report')
            }

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition')
            let filename = `report_${reportType}_${duration}_${new Date().toISOString().split('T')[0]}.xlsx`
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
                if (filenameMatch) {
                    filename = filenameMatch[1]
                }
            }

            // Convert response to blob and download
            const blob = await response.blob()
            const url_blob = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url_blob
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url_blob)

            setMessage({ type: 'success', text: 'Report downloaded successfully!' })
            
            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' })
            }, 3000)

        } catch (error) {
            console.error('Error downloading report:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to download report. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ]
            const validExtensions = ['.xlsx', '.xls']
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            
            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: 'Please upload only Excel files (.xlsx, .xls)' })
                e.target.value = '' // Reset file input
                return
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size should be less than 10MB' })
                e.target.value = '' // Reset file input
                return
            }
            
            setSelectedFile(file)
            setMessage({ type: '', text: '' })
        }
    }

    // Handle Excel file upload
    const handleUploadExcel = async () => {
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'Please select an Excel file to upload' })
            return
        }

        setUploadLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const url = `${API_BASE_URL}/api/subject-types/upload`
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload file')
            }

            setMessage({ type: 'success', text: result.message || 'Excel file uploaded and data saved successfully!' })
            setSelectedFile(null)
            
            // Reset file input
            const fileInput = document.getElementById('data-upload')
            if (fileInput) {
                fileInput.value = ''
            }
            
            // Refresh uploaded data and files
            fetchUploadedData()
            fetchUploadedFiles()
            
            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' })
            }, 5000)

        } catch (error) {
            console.error('Error uploading file:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to upload file. Please try again.' })
        } finally {
            setUploadLoading(false)
        }
    }

    // Fetch uploaded subject types data
    const fetchUploadedData = async () => {
        setDataLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/subject-types/grouped`)
            const result = await response.json()
            
            if (result.success) {
                setUploadedData(result.data)
            }
        } catch (error) {
            console.error('Error fetching uploaded data:', error)
        } finally {
            setDataLoading(false)
        }
    }

    // Fetch uploaded Excel files
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/subject-types/uploaded-files`)
            const result = await response.json()
            
            if (result.success) {
                setUploadedFiles(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching uploaded files:', error)
        }
    }

    // Download Excel file
    const handleDownloadFile = async (fileId, filename) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/subject-types/download-file/${fileId}`)
            
            if (!response.ok) {
                throw new Error('Failed to download file')
            }

            const blob = await response.blob()
            const url_blob = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url_blob
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url_blob)
        } catch (error) {
            console.error('Error downloading file:', error)
            setMessage({ type: 'error', text: 'Failed to download file' })
        }
    }

    // Fetch uploaded eligibility data
    const fetchEligibilityUploadedData = async () => {
        setEligibilityDataLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/eligibility-types/grouped`)
            const result = await response.json()
            
            if (result.success) {
                setEligibilityUploadedData(result.data)
            }
        } catch (error) {
            console.error('Error fetching eligibility uploaded data:', error)
        } finally {
            setEligibilityDataLoading(false)
        }
    }

    // Fetch uploaded eligibility Excel files
    const fetchEligibilityUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/eligibility-types/uploaded-files`)
            const result = await response.json()
            
            if (result.success) {
                setEligibilityUploadedFiles(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching eligibility uploaded files:', error)
        }
    }

    // Handle eligibility file selection
    const handleEligibilityFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ]
            const validExtensions = ['.xlsx', '.xls']
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            
            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: 'Please upload only Excel files (.xlsx, .xls)' })
                e.target.value = '' // Reset file input
                return
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size should be less than 10MB' })
                e.target.value = '' // Reset file input
                return
            }
            
            setEligibilitySelectedFile(file)
            setMessage({ type: '', text: '' })
        }
    }

    // Handle eligibility Excel file upload
    const handleEligibilityUploadExcel = async () => {
        if (!eligibilitySelectedFile) {
            setMessage({ type: 'error', text: 'Please select an Excel file to upload' })
            return
        }

        setEligibilityUploadLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            formData.append('file', eligibilitySelectedFile)

            const url = `${API_BASE_URL}/api/eligibility-types/upload`
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload file')
            }

            setMessage({ type: 'success', text: result.message || 'Excel file uploaded and data saved successfully!' })
            setEligibilitySelectedFile(null)
            
            // Reset file input
            const fileInput = document.getElementById('eligibility-data-upload')
            if (fileInput) {
                fileInput.value = ''
            }
            
            // Refresh uploaded data and files
            fetchEligibilityUploadedData()
            fetchEligibilityUploadedFiles()
            
            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' })
            }, 5000)

        } catch (error) {
            console.error('Error uploading eligibility file:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to upload file. Please try again.' })
        } finally {
            setEligibilityUploadLoading(false)
        }
    }

    // Download eligibility Excel file
    const handleDownloadEligibilityFile = async (fileId, filename) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/eligibility-types/download-file/${fileId}`)
            
            if (!response.ok) {
                throw new Error('Failed to download file')
            }

            const blob = await response.blob()
            const url_blob = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url_blob
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url_blob)
        } catch (error) {
            console.error('Error downloading eligibility file:', error)
            setMessage({ type: 'error', text: 'Failed to download file' })
        }
    }

    // Fetch uploaded pattern data
    const fetchPatternUploadedData = async () => {
        setPatternDataLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/pattern-types/grouped`)
            const result = await response.json()
            
            if (result.success) {
                setPatternUploadedData(result.data)
            }
        } catch (error) {
            console.error('Error fetching pattern uploaded data:', error)
        } finally {
            setPatternDataLoading(false)
        }
    }

    // Fetch uploaded pattern Excel files
    const fetchPatternUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pattern-types/uploaded-files`)
            const result = await response.json()
            
            if (result.success) {
                setPatternUploadedFiles(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching pattern uploaded files:', error)
        }
    }

    // Handle pattern file selection
    const handlePatternFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ]
            const validExtensions = ['.xlsx', '.xls']
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            
            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: 'Please upload only Excel files (.xlsx, .xls)' })
                e.target.value = '' // Reset file input
                return
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size should be less than 10MB' })
                e.target.value = '' // Reset file input
                return
            }
            
            setPatternSelectedFile(file)
            setMessage({ type: '', text: '' })
        }
    }

    // Handle pattern Excel file upload
    const handlePatternUploadExcel = async () => {
        if (!patternSelectedFile) {
            setMessage({ type: 'error', text: 'Please select an Excel file to upload' })
            return
        }

        setPatternUploadLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            formData.append('file', patternSelectedFile)

            const url = `${API_BASE_URL}/api/pattern-types/upload`
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload file')
            }

            setMessage({ type: 'success', text: result.message || 'Excel file uploaded and data saved successfully!' })
            setPatternSelectedFile(null)
            
            // Reset file input
            const fileInput = document.getElementById('pattern-data-upload')
            if (fileInput) {
                fileInput.value = ''
            }
            
            // Refresh uploaded data and files
            fetchPatternUploadedData()
            fetchPatternUploadedFiles()
            
            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' })
            }, 5000)

        } catch (error) {
            console.error('Error uploading pattern file:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to upload file. Please try again.' })
        } finally {
            setPatternUploadLoading(false)
        }
    }

    // Download pattern Excel file
    const handleDownloadPatternFile = async (fileId, filename) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pattern-types/download-file/${fileId}`)
            
            if (!response.ok) {
                throw new Error('Failed to download file')
            }

            const blob = await response.blob()
            const url_blob = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url_blob
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url_blob)
        } catch (error) {
            console.error('Error downloading pattern file:', error)
            setMessage({ type: 'error', text: 'Failed to download file' })
        }
    }

    // Fetch uploaded award data
    const fetchAwardUploadedData = async () => {
        setAwardDataLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/award-types/grouped`)
            const result = await response.json()
            
            if (result.success) {
                setAwardUploadedData(result.data)
            }
        } catch (error) {
            console.error('Error fetching award uploaded data:', error)
        } finally {
            setAwardDataLoading(false)
        }
    }

    // Fetch uploaded award Excel files
    const fetchAwardUploadedFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/award-types/uploaded-files`)
            const result = await response.json()
            
            if (result.success) {
                setAwardUploadedFiles(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching award uploaded files:', error)
        }
    }

    // Handle award file selection
    const handleAwardFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ]
            const validExtensions = ['.xlsx', '.xls']
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            
            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: 'Please upload only Excel files (.xlsx, .xls)' })
                e.target.value = '' // Reset file input
                return
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size should be less than 10MB' })
                e.target.value = '' // Reset file input
                return
            }
            
            setAwardSelectedFile(file)
            setMessage({ type: '', text: '' })
        }
    }

    // Handle award Excel file upload
    const handleAwardUploadExcel = async () => {
        if (!awardSelectedFile) {
            setMessage({ type: 'error', text: 'Please select an Excel file to upload' })
            return
        }

        setAwardUploadLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const formData = new FormData()
            formData.append('file', awardSelectedFile)

            const url = `${API_BASE_URL}/api/award-types/upload`
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload file')
            }

            setMessage({ type: 'success', text: result.message || 'Excel file uploaded and data saved successfully!' })
            setAwardSelectedFile(null)
            
            // Reset file input
            const fileInput = document.getElementById('award-data-upload')
            if (fileInput) {
                fileInput.value = ''
            }
            
            // Refresh uploaded data and files
            fetchAwardUploadedData()
            fetchAwardUploadedFiles()
            
            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' })
            }, 5000)

        } catch (error) {
            console.error('Error uploading award file:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to upload file. Please try again.' })
        } finally {
            setAwardUploadLoading(false)
        }
    }

    // Download award Excel file
    const handleDownloadAwardFile = async (fileId, filename) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/award-types/download-file/${fileId}`)
            
            if (!response.ok) {
                throw new Error('Failed to download file')
            }

            const blob = await response.blob()
            const url_blob = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url_blob
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url_blob)
        } catch (error) {
            console.error('Error downloading award file:', error)
            setMessage({ type: 'error', text: 'Failed to download file' })
        }
    }

    // Fetch data when tab changes or uploadType changes
    useEffect(() => {
        if (activeTab === 'update') {
            if (uploadType === 'subject-type') {
                fetchUploadedData()
                fetchUploadedFiles()
            } else if (uploadType === 'eligibility-type') {
                fetchEligibilityUploadedData()
                fetchEligibilityUploadedFiles()
            } else if (uploadType === 'pattern-type') {
                fetchPatternUploadedData()
                fetchPatternUploadedFiles()
            } else if (uploadType === 'award-type') {
                fetchAwardUploadedData()
                fetchAwardUploadedFiles()
            }
        }
    }, [activeTab, uploadType])

    return (
        <div style={{ padding: 24 }}>
            <h2>Enter Customer Details</h2>

            <div style={{ display: 'flex', gap: 24, marginTop: 12, borderBottom: '1px solid #e5e7eb' }}>
                <button
                    type="button"
                    style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '10px 16px',
                        borderBottom: activeTab === 'download' ? '3px solid #22c55e' : '3px solid transparent',
                        color: activeTab === 'download' ? '#22c55e' : '#1f2937',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'none'
                    }}
                    onClick={() => setActiveTab('download')}
                >
                    Download Report
                </button>
                <button
                    type="button"
                    style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '10px 16px',
                        borderBottom: activeTab === 'update' ? '3px solid #22c55e' : '3px solid transparent',
                        color: activeTab === 'update' ? '#22c55e' : '#1f2937',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'none'
                    }}
                    onClick={() => setActiveTab('update')}
                >
                    Update database
                </button>
            </div>

            {activeTab === 'download' && (
                <div style={{ marginTop: 24 }}>
                    {message.text && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: 16,
                                borderRadius: 8,
                                backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                                color: message.type === 'error' ? '#991b1b' : '#065f46',
                                fontSize: 14,
                                fontWeight: 500
                            }}
                        >
                            {message.text}
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900 }}>
                        <LabeledSelect label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                            <option value="">Select</option>
                            <option value="payments">Payments</option>
                            <option value="registered-students">Registered Students</option>
                            <option value="registered-organisers">Registered Organisers</option>
                            <option value="competitions">Competitions</option>
                            <option value="registrations">Registrations</option>
                        </LabeledSelect>
                        <LabeledSelect label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="">Select</option>
                            <option value="1d">1 day</option>
                            <option value="1w">1 week</option>
                            <option value="1m">1 month</option>
                            <option value="1y">1 year</option>
                        </LabeledSelect>
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <button
                            type="button"
                            onClick={handleDownloadReport}
                            disabled={!reportType || !duration || loading}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 10,
                                backgroundColor: brandGreen,
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: 8,
                                fontWeight: 600,
                                opacity: !reportType || !duration || loading ? 0.6 : 1,
                                cursor: !reportType || !duration || loading ? 'not-allowed' : 'pointer',
                                transition: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ display: 'inline-block' }}>⏳</span>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" style={{ fill: 'currentColor' }}>
                                        <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                        <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                    </svg>
                                    Download Report
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'update' && (
                <div style={{ marginTop: 24 }}>
                    {message.text && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: 16,
                                borderRadius: 8,
                                backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                                color: message.type === 'error' ? '#991b1b' : '#065f46',
                                fontSize: 14,
                                fontWeight: 500
                            }}
                        >
                            {message.text}
                        </div>
                    )}
                    <div style={{ maxWidth: 520 }}>
                        <LabeledSelect label="Select Type" value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                            <option value="">Select</option>
                            <option value="subject-type">Subject Type</option>
                            <option value="eligibility-type">Eligibility Type</option>
                            <option value="pattern-type">Pattern Type</option>
                            <option value="award-type">Award Type</option>
                        </LabeledSelect>
                    </div>

                    {uploadType && (
                        <>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
                                <label
                                    htmlFor={uploadType === 'subject-type' ? "data-upload" : uploadType === 'eligibility-type' ? "eligibility-data-upload" : uploadType === 'pattern-type' ? "pattern-data-upload" : "award-data-upload"}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        color: brandGreen,
                                        border: `1px solid ${brandGreen}`,
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        transition: 'none'
                                    }}
                                >
                                    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" style={{ fill: brandGreen }}>
                                        <path d="M12 21a1 1 0 01-1-1v-9.586l-2.293 2.293a1 1 0 11-1.414-1.414l4.007-4.007a1 1 0 011.414 0l4.007 4.007a1 1 0 11-1.414 1.414L13 10.414V20a1 1 0 01-1 1z" />
                                        <path d="M5 4a2 2 0 00-2 2v2a1 1 0 102 0V6h10v2a1 1 0 102 0V6a2 2 0 00-2-2H5z" />
                                    </svg>
                                    {uploadType === 'subject-type' ? (selectedFile ? selectedFile.name : 'Choose Excel File') 
                                        : uploadType === 'eligibility-type' ? (eligibilitySelectedFile ? eligibilitySelectedFile.name : 'Choose Excel File')
                                        : uploadType === 'pattern-type' ? (patternSelectedFile ? patternSelectedFile.name : 'Choose Excel File')
                                        : (awardSelectedFile ? awardSelectedFile.name : 'Choose Excel File')}
                                </label>
                                <input 
                                    id={uploadType === 'subject-type' ? "data-upload" : uploadType === 'eligibility-type' ? "eligibility-data-upload" : uploadType === 'pattern-type' ? "pattern-data-upload" : "award-data-upload"} 
                                    type="file" 
                                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    style={{ display: 'none' }} 
                                    onChange={uploadType === 'subject-type' ? handleFileSelect : uploadType === 'eligibility-type' ? handleEligibilityFileSelect : uploadType === 'pattern-type' ? handlePatternFileSelect : handleAwardFileSelect}
                                />
                            </div>

                            {((uploadType === 'subject-type' ? selectedFile : uploadType === 'eligibility-type' ? eligibilitySelectedFile : uploadType === 'pattern-type' ? patternSelectedFile : awardSelectedFile)) && (
                                <div style={{ marginTop: 12, padding: '12px', backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bae6fd' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0369a1' }}>
                                        <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                        <span>Selected: {(uploadType === 'subject-type' ? selectedFile : uploadType === 'eligibility-type' ? eligibilitySelectedFile : uploadType === 'pattern-type' ? patternSelectedFile : awardSelectedFile).name} ({((uploadType === 'subject-type' ? selectedFile : uploadType === 'eligibility-type' ? eligibilitySelectedFile : uploadType === 'pattern-type' ? patternSelectedFile : awardSelectedFile).size / 1024).toFixed(2)} KB)</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (uploadType === 'subject-type') {
                                                    setSelectedFile(null)
                                                    const fileInput = document.getElementById('data-upload')
                                                    if (fileInput) fileInput.value = ''
                                                } else if (uploadType === 'eligibility-type') {
                                                    setEligibilitySelectedFile(null)
                                                    const fileInput = document.getElementById('eligibility-data-upload')
                                                    if (fileInput) fileInput.value = ''
                                                } else if (uploadType === 'pattern-type') {
                                                    setPatternSelectedFile(null)
                                                    const fileInput = document.getElementById('pattern-data-upload')
                                                    if (fileInput) fileInput.value = ''
                                                } else {
                                                    setAwardSelectedFile(null)
                                                    const fileInput = document.getElementById('award-data-upload')
                                                    if (fileInput) fileInput.value = ''
                                                }
                                            }}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'none',
                                                border: 'none',
                                                color: '#dc2626',
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                fontSize: 12
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 18 }}>
                                <button
                                    type="button"
                                    onClick={uploadType === 'subject-type' ? handleUploadExcel : uploadType === 'eligibility-type' ? handleEligibilityUploadExcel : uploadType === 'pattern-type' ? handlePatternUploadExcel : handleAwardUploadExcel}
                                    disabled={(uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) || (uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        border: `1px solid ${(uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) || (uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading) ? '#9ca3af' : brandGreen}`,
                                        color: (uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) || (uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading) ? '#374151' : brandGreen,
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        opacity: (uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) || (uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading) ? 0.6 : 1,
                                        cursor: (uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) || (uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading) ? 'not-allowed' : 'pointer',
                                        background: '#ffffff',
                                        transition: 'none',
                                        boxShadow: 'none'
                                    }}
                                >
                                    {(uploadType === 'subject-type' ? uploadLoading : uploadType === 'eligibility-type' ? eligibilityUploadLoading : uploadType === 'pattern-type' ? patternUploadLoading : awardUploadLoading) ? (
                                        <>
                                            <span style={{ display: 'inline-block' }}>⏳</span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" style={{ fill: (uploadType === 'subject-type' ? !selectedFile : uploadType === 'eligibility-type' ? !eligibilitySelectedFile : uploadType === 'pattern-type' ? !patternSelectedFile : !awardSelectedFile) ? '#374151' : brandGreen }}>
                                                <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                                <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                            </svg>
                                            Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Display Uploaded Data - Subject Type */}
                    {uploadType === 'subject-type' && (
                        <>
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Subject Types Data
                                </h3>
                                
                                {dataLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        Loading data...
                                    </div>
                                ) : uploadedData ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {Object.keys(uploadedData).map(category => (
                                            <div key={category} style={{ 
                                                border: '1px solid #e5e7eb', 
                                                borderRadius: 8, 
                                                padding: 16,
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 600, 
                                                    marginBottom: 12, 
                                                    color: brandGreen 
                                                }}>
                                                    {category} ({uploadedData[category].length} subjects)
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {uploadedData[category].map((item, idx) => (
                                                        <div key={idx} style={{
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: 6,
                                                            padding: '8px 12px',
                                                            fontSize: 13
                                                        }}>
                                                            <div style={{ fontWeight: 500, color: textPrimary, marginBottom: 4 }}>
                                                                {item.subject}
                                                            </div>
                                                            {item.subtopics && item.subtopics.length > 0 && (
                                                                <div style={{ fontSize: 11, color: textMuted }}>
                                                                    {item.subtopics.length} subtopic(s)
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No data uploaded yet
                                    </div>
                                )}
                            </div>

                            {/* Display Uploaded Excel Files - Subject Type */}
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Excel Files
                                </h3>
                                
                                {uploadedFiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {uploadedFiles.map((file) => (
                                            <div key={file._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 8,
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                                    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" style={{ fill: brandGreen }}>
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                                        <path d="M14 2v6h6" />
                                                    </svg>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: textPrimary, fontSize: 14 }}>
                                                            {file.originalName}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                                                            {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadFile(file._id, file.originalName)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '8px 16px',
                                                        backgroundColor: brandGreen,
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                                                        <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                                        <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No Excel files uploaded yet
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Display Uploaded Data - Eligibility Type */}
                    {uploadType === 'eligibility-type' && (
                        <>
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Eligibility Data
                                </h3>
                                
                                {eligibilityDataLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        Loading data...
                                    </div>
                                ) : eligibilityUploadedData ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {Object.keys(eligibilityUploadedData).map(category => (
                                            <div key={category} style={{ 
                                                border: '1px solid #e5e7eb', 
                                                borderRadius: 8, 
                                                padding: 16,
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 600, 
                                                    marginBottom: 12, 
                                                    color: brandGreen 
                                                }}>
                                                    {category} ({eligibilityUploadedData[category].length} items)
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {eligibilityUploadedData[category].map((item, idx) => (
                                                        <div key={idx} style={{
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: 6,
                                                            padding: '8px 12px',
                                                            fontSize: 13
                                                        }}>
                                                            <div style={{ fontWeight: 500, color: textPrimary, marginBottom: 4 }}>
                                                                {item.value}
                                                            </div>
                                                            {item.label && (
                                                                <div style={{ fontSize: 11, color: textMuted }}>
                                                                    {item.label}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No data uploaded yet
                                    </div>
                                )}
                            </div>

                            {/* Display Uploaded Excel Files - Eligibility Type */}
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Excel Files
                                </h3>
                                
                                {eligibilityUploadedFiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {eligibilityUploadedFiles.map((file) => (
                                            <div key={file._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 8,
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                                    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" style={{ fill: brandGreen }}>
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                                        <path d="M14 2v6h6" />
                                                    </svg>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: textPrimary, fontSize: 14 }}>
                                                            {file.originalName}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                                                            {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadEligibilityFile(file._id, file.originalName)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '8px 16px',
                                                        backgroundColor: brandGreen,
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                                                        <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                                        <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No Excel files uploaded yet
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Display Uploaded Data - Pattern Type */}
                    {uploadType === 'pattern-type' && (
                        <>
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Pattern Data
                                </h3>
                                
                                {patternDataLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        Loading data...
                                    </div>
                                ) : patternUploadedData ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {Object.keys(patternUploadedData).map(category => (
                                            <div key={category} style={{ 
                                                border: '1px solid #e5e7eb', 
                                                borderRadius: 8, 
                                                padding: 16,
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 600, 
                                                    marginBottom: 12, 
                                                    color: brandGreen 
                                                }}>
                                                    {category} ({patternUploadedData[category].length} formats)
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {patternUploadedData[category].map((item, idx) => (
                                                        <div key={idx} style={{
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: 6,
                                                            padding: '8px 12px',
                                                            fontSize: 13
                                                        }}>
                                                            <div style={{ fontWeight: 500, color: textPrimary }}>
                                                                {item.format}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No data uploaded yet
                                    </div>
                                )}
                            </div>

                            {/* Display Uploaded Excel Files - Pattern Type */}
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Excel Files
                                </h3>
                                
                                {patternUploadedFiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {patternUploadedFiles.map((file) => (
                                            <div key={file._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 8,
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                                    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" style={{ fill: brandGreen }}>
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                                        <path d="M14 2v6h6" />
                                                    </svg>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: textPrimary, fontSize: 14 }}>
                                                            {file.originalName}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                                                            {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadPatternFile(file._id, file.originalName)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '8px 16px',
                                                        backgroundColor: brandGreen,
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                                                        <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                                        <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No Excel files uploaded yet
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Display Uploaded Data - Award Type */}
                    {uploadType === 'award-type' && (
                        <>
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Award Data
                                </h3>
                                
                                {awardDataLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        Loading data...
                                    </div>
                                ) : awardUploadedData ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {Object.keys(awardUploadedData).map(category => (
                                            <div key={category} style={{ 
                                                border: '1px solid #e5e7eb', 
                                                borderRadius: 8, 
                                                padding: 16,
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 600, 
                                                    marginBottom: 12, 
                                                    color: brandGreen 
                                                }}>
                                                    {category} ({awardUploadedData[category].length} awards)
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {awardUploadedData[category].map((item, idx) => (
                                                        <div key={idx} style={{
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: 6,
                                                            padding: '8px 12px',
                                                            fontSize: 13
                                                        }}>
                                                            <div style={{ fontWeight: 500, color: textPrimary, marginBottom: 4 }}>
                                                                {item.label}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: textMuted }}>
                                                                {item.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No data uploaded yet
                                    </div>
                                )}
                            </div>

                            {/* Display Uploaded Excel Files - Award Type */}
                            <div style={{ marginTop: 40, borderTop: '2px solid #e5e7eb', paddingTop: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: textPrimary }}>
                                    Uploaded Excel Files
                                </h3>
                                
                                {awardUploadedFiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {awardUploadedFiles.map((file) => (
                                            <div key={file._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 8,
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                                    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" style={{ fill: brandGreen }}>
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                                        <path d="M14 2v6h6" />
                                                    </svg>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: textPrimary, fontSize: 14 }}>
                                                            {file.originalName}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                                                            {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadAwardFile(file._id, file.originalName)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '8px 16px',
                                                        backgroundColor: brandGreen,
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                                                        <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4.007 4.007a1 1 0 01-1.414 0L7.279 12.707a1 1 0 011.414-1.414L11 13.586V4a1 1 0 011-1z" />
                                                        <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0v2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                                        No Excel files uploaded yet
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default DataManagementPage
