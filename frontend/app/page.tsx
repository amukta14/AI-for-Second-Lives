"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Upload, QrCode, Zap } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [productName, setProductName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isCameraOpen && videoRef.current && window.streamForCamera) {
      videoRef.current.srcObject = window.streamForCamera;
      videoRef.current.play();
    }
    if (isBarcodeScanning && videoRef.current && window.streamForBarcode) {
      videoRef.current.srcObject = window.streamForBarcode;
      videoRef.current.play();
    }
  }, [isCameraOpen, isBarcodeScanning]);

  const handleAnalyze = async (imageData?: string) => {
    if (!productName.trim() && !imageData) return
    
    setIsAnalyzing(true)
    try {
      const requestBody: any = {}
      
      if (imageData) {
        requestBody.imageBase64 = imageData
        console.log('Sending image analysis request...')
      } else if (productName.trim()) {
        requestBody.productName = productName.trim()
        console.log('Sending text analysis request...')
      }

      console.log('Request body:', { 
        hasImage: !!imageData, 
        hasProductName: !!productName.trim(),
        imageSize: imageData ? imageData.length : 0 
      })

      const response = await fetch('http://localhost:3002/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analysis successful:', data)
        // Store results in sessionStorage for results page
        sessionStorage.setItem('analysisResults', JSON.stringify(data))
        router.push('/results')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Analysis failed:', response.status, errorData)
        alert(`Failed to analyze product. Status: ${response.status}. Please try again.`)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error. Please check your connection.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      window.streamForCamera = stream;
      setIsCameraOpen(true)
    } catch (error) {
      alert('Camera access denied. Please allow camera permissions.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setSelectedImage(imageData)
        
        // Stop camera stream and close modal immediately
        const stream = videoRef.current.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        window.streamForCamera = null;
        setIsCameraOpen(false)
        
        // Analyze the captured image
        handleAnalyze(imageData)
      }
    }
  }

  const handleUploadImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setSelectedImage(imageData)
        handleAnalyze(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScanBarcode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      window.streamForBarcode = stream;
      setIsBarcodeScanning(true)
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d')
          if (context) {
            canvasRef.current.width = videoRef.current.videoWidth
            canvasRef.current.height = videoRef.current.videoHeight
            context.drawImage(videoRef.current, 0, 0)
            const imageData = canvasRef.current.toDataURL('image/jpeg')
            // Stop camera stream and close modal immediately
            const stream = videoRef.current.srcObject as MediaStream
            stream?.getTracks().forEach(track => track.stop())
            window.streamForBarcode = null;
            setIsBarcodeScanning(false)
            handleAnalyze(imageData)
          }
        }
      }, 3000)
    } catch (error) {
      alert('Camera access denied. Please allow camera permissions.')
    }
  }

  const handleEcoRewards = () => {
    router.push('/dashboard')
  }

  const handleWalmartUpcycle = () => {
    // Show Walmart upcycle info or navigate to a specific section
    alert('Walmart Upcycle Program: Get rewards for reusing and recycling items! Visit your local Walmart for more details.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Hero Section Overhaul */}
      <section className="w-full min-h-[500px] flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-[#0071CE]/90 to-[#FFC220]/60 rounded-3xl shadow-2xl mx-4 mt-8 mb-10 p-6 lg:p-12 backdrop-blur-sm">
        {/* Left: Big AI reuse idea */}
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center text-center lg:text-left mb-8 lg:mb-0">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-4 animate-pulse text-white drop-shadow-lg">
            AI for Second Lives
          </h1>
          <div className="text-2xl lg:text-3xl font-bold mb-6 text-[#222] max-w-xl bg-white/80 rounded-xl p-4 shadow-lg">
            Turn your shampoo bottle into a plant pot!
          </div>
          <div className="flex gap-3 mt-6 flex-wrap justify-center lg:justify-start">
            <button 
              onClick={handleEcoRewards}
              className="inline-block bg-[#FFC220] text-[#222] px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              Eco Rewards
            </button>
            <button 
              onClick={handleWalmartUpcycle}
              className="inline-block bg-[#0071CE] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              Walmart Upcycle
            </button>
          </div>
        </div>
        
        {/* Right: Before & After preview */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-32 h-32 bg-white rounded-2xl border-4 border-[#0071CE] shadow-xl flex items-center justify-center">
                <span className="text-4xl">🧴</span>
              </div>
              <div className="text-center mt-3 text-sm font-bold text-white bg-[#0071CE] rounded-full px-3 py-1">
                Before
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-32 h-32 bg-white rounded-2xl border-4 border-[#FFC220] shadow-xl flex items-center justify-center">
                <span className="text-4xl">🪴</span>
              </div>
              <div className="text-center mt-3 text-sm font-bold text-[#222] bg-[#FFC220] rounded-full px-3 py-1">
                After
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 text-6xl font-bold text-white/50 animate-pulse">
              →
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Scan & Discover New Possibilities
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Upload a photo, scan a barcode, or take a picture to get creative reuse and recycling ideas
          </p>

          {/* Analysis Progress Animation */}
          {isAnalyzing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0071CE] mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">AI is thinking...</h3>
                <p className="text-gray-600 mb-4">Analyzing your item for creative reuse ideas</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#0071CE] to-[#FFC220] h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Take Photo</h3>
                <video 
                  ref={videoRef} 
                  className="w-full rounded mb-4"
                  autoPlay
                  playsInline
                  style={{ background: '#000' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const stream = videoRef.current?.srcObject as MediaStream
                      stream?.getTracks().forEach(track => track.stop())
                      window.streamForCamera = null;
                      setIsCameraOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Barcode Scanner Modal */}
          {isBarcodeScanning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Scanning Barcode...</h3>
                <video 
                  ref={videoRef} 
                  className="w-full rounded mb-4"
                  autoPlay
                  playsInline
                  style={{ background: '#000' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-sm text-gray-600 mb-4">
                  Point your camera at a barcode. Capturing in 3 seconds...
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream
                    stream?.getTracks().forEach(track => track.stop())
                    window.streamForBarcode = null;
                    setIsBarcodeScanning(false)
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Upload Card */}
          <Card className="mb-8 border-2 border-dashed border-gray-300 hover:border-primary transition-colors shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">How would you like to scan?</CardTitle>
              <CardDescription>
                Choose your preferred method to analyze your item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera Upload */}
              <div className="flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 h-auto"
                  onClick={handleTakePhoto}
                  disabled={isAnalyzing}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
              </div>

              {/* File Upload */}
              <div className="flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-300 hover:border-primary px-8 py-4 h-auto"
                  onClick={handleUploadImage}
                  disabled={isAnalyzing}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Barcode Scanner */}
              <div className="flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-300 hover:border-primary px-8 py-4 h-auto"
                  onClick={handleScanBarcode}
                  disabled={isAnalyzing}
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Scan Barcode
                </Button>
              </div>

              {/* Manual Input */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Or enter a product name manually:</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., plastic water bottle, cardboard box..."
                    className="flex-1"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing || !productName.trim()}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Ideas</h3>
                <p className="text-sm text-gray-600">Get creative reuse suggestions from Gemini AI</p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Save & Share</h3>
                <p className="text-sm text-gray-600">Store your favorite ideas and share DIY projects</p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Local Recycling</h3>
                <p className="text-sm text-gray-600">Find recycling centers near you</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
