import { useState } from 'react'
import '../styles/Files.css'

const Files = () => {
  const [file, setFile] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState('')

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3000/file')
      if (!response.ok) throw new Error('Failed to download file')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'hello.txt'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setUploadMessage('')
    setUploadError('')
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (response.ok) {
        setUploadMessage(data.message)
        setUploadError('')
        setFile(null)
      } else {
        setUploadError(data.error || 'Upload failed')
        setUploadMessage('')
      }
    } catch (err) {
      setUploadError('Upload failed')
      setUploadMessage('')
    }
  }

  return (
    <div className="files-container">
      <h1 className="files-title">Files</h1>

      <div className="files-sections">
        <div className="file-card">
          <h2 className="card-title">Download</h2>
          <p className="card-description">Download the sample hello.txt file from the server</p>
          <button onClick={handleDownload} className="download-button">
            Download hello.txt
          </button>
        </div>

        <div className="file-card">
          <h2 className="card-title">Upload</h2>
          <p className="card-description">Upload a file to the server</p>
          
          <label className="file-input-label">
            {file ? file.name : 'Choose a file'}
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>

          <button onClick={handleUpload} className="upload-button">
            Upload
          </button>

          {uploadMessage && <div className="success-message">{uploadMessage}</div>}
          {uploadError && <div className="error-message">{uploadError}</div>}
        </div>
      </div>
    </div>
  )
}

export default Files
