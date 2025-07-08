"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Zap, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SubmitPage() {
  // Mock state - replace with real form state
  const [materials, setMaterials] = useState<string[]>([''])
  const [difficulty, setDifficulty] = useState('Easy')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Reuse')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const addMaterial = () => {
    setMaterials([...materials, ''])
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials]
    newMaterials[index] = value
    setMaterials(newMaterials)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChooseFiles = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Compose materials, etc.
    const payload = {
      title,
      type,
      difficulty,
      description,
      materials: materials.filter(Boolean),
      imageUrl: imageUrl.trim(),
      approved: false,
      source: "submit",
    }
    const response = await fetch('http://localhost:3002/submit-diy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      alert('DIY project submitted!')
      // Reset form
      setTitle('')
      setType('Reuse')
      setDifficulty('Easy')
      setDescription('')
      setMaterials([''])
      setImageUrl('')
    } else {
      alert('Failed to submit DIY project.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              <h1 className="text-2xl font-bold">AI for Second Lives</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Share Your DIY Idea</h2>
            <p className="text-gray-600">Help others discover creative ways to reuse and recycle items</p>
          </div>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>DIY Project Details</CardTitle>
              <CardDescription>
                Fill out the form below to share your creative reuse or recycling idea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <Input 
                    placeholder="e.g., Plastic Bottle Plant Watering Can"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <div className="flex gap-2">
                    {['Reuse', 'Recycle', 'Upcycle'].map((t) => (
                      <Badge 
                        key={t}
                        variant={type === t ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary hover:text-white"
                        onClick={() => setType(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <Badge 
                        key={level}
                        variant={difficulty === level ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setDifficulty(level)}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <Textarea 
                    placeholder="Describe your DIY project in detail. Include step-by-step instructions..."
                    rows={4}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Materials */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials Needed
                  </label>
                  <div className="space-y-2">
                    {materials.map((material, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder="e.g., Plastic bottle, scissors, glue"
                          value={material}
                          onChange={(e) => updateMaterial(index, e.target.value)}
                        />
                        {materials.length > 1 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeMaterial(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addMaterial}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    placeholder="Paste a link to an image (e.g., https://... .jpg/.png)"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) && (
                    <img src={imageUrl} alt="Preview" className="mt-2 max-h-40 rounded border" />
                  )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a great submission:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific and detailed in your instructions</li>
                    <li>• Include safety considerations if applicable</li>
                    <li>• Add photos of your finished project</li>
                    <li>• Mention any special tools or skills needed</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1"
                    size="lg"
                  >
                    Submit DIY Project
                  </Button>
                  <Link href="/">
                    <Button variant="outline" size="lg">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 