"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Share2, Download, Zap, MapPin, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
const USER_ID = 'demo-user'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

async function fetchUnsplashImage(query: string) {
  if (!UNSPLASH_ACCESS_KEY) return null
  const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=squarish&per_page=1`)
  const data = await res.json()
  return data.results?.[0]?.urls?.regular || null
}

export default function ResultsPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [tutorialModal, setTutorialModal] = useState<{title: string, tutorial: string} | null>(null)
  const [tutorialLoading, setTutorialLoading] = useState(false)
  const [addingReuse, setAddingReuse] = useState<string | null>(null)
  const [reuseMsg, setReuseMsg] = useState('')

  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResults')
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      setResults(parsed)
      // Fetch Unsplash images for each suggestion
      if (parsed.suggestions) {
        Promise.all(parsed.suggestions.map((s: any) => fetchUnsplashImage(s.title + ' ' + (s.description || ''))))
          .then(setImages)
      }
    }
    setLoading(false)
  }, [])

  const handleSaveIdea = async (suggestion: any) => {
    setSaving(suggestion.title)
    // Compose payload for backend
    const payload = {
      title: suggestion.title,
      description: suggestion.description,
      type: suggestion.type,
      difficulty: suggestion.difficulty,
      materials: suggestion.materials,
      imageUrl: images[results.suggestions.findIndex((s: any) => s.title === suggestion.title)] || '',
      productName: results.productName,
      approved: true,
      source: "scan",
    }
    const response = await fetch('http://localhost:3002/submit-diy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(null)
    if (response.ok) {
      alert('Idea saved!')
    } else {
      alert('Failed to save idea.')
    }
  }

  const handleViewTutorial = async (suggestion: any) => {
    setTutorialLoading(true)
    setTutorialModal({ title: suggestion.title, tutorial: '' })
    const response = await fetch('/api/generate-tutorial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: suggestion.title, description: suggestion.description })
    })
    const data = await response.json()
    setTutorialModal({ title: suggestion.title, tutorial: data.tutorial })
    setTutorialLoading(false)
  }

  const handleAddToReuse = async (suggestion: any) => {
    setAddingReuse(suggestion.title)
    setReuseMsg('')
    await fetch(`${API_URL}/users/${USER_ID}/eco-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'reuse' })
    })
    setReuseMsg(`Added "${suggestion.title}" to your reuse list!`)
    setTimeout(() => setReuseMsg(''), 2000)
    setAddingReuse(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No analysis results found.</p>
          <Link href="/">
            <Button>Start New Analysis</Button>
          </Link>
        </div>
      </div>
    )
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
        {/* Product Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{results.productName}</CardTitle>
            {results.material && (
              <CardDescription>
                Material: <Badge variant="secondary">{results.material}</Badge>
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Here are your second life options:</h2>
          
          {results.suggestions && results.suggestions.length > 0 ? (
            results.suggestions.map((suggestion: any, index: number) => (
              <Card key={index} className="overflow-hidden fade-in">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gray-200 flex items-center justify-center p-6">
                    {images[index] ? (
                      <img src={images[index]} alt={suggestion.title} className="object-cover w-full h-48 rounded" />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Image placeholder</p>
                      </div>
                    )}
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={suggestion.type === 'reuse' ? 'default' : suggestion.type === 'recycle' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {suggestion.type}
                          </Badge>
                          {suggestion.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {suggestion.difficulty}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{suggestion.title}</h3>
                        <p className="text-gray-600 mb-4">{suggestion.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {suggestion.materials && suggestion.materials.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Materials needed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.materials.map((material: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 flex-wrap">
                        <Button
                          className="bg-yellow-400 hover:bg-yellow-500 text-black flex items-center"
                          onClick={() => window.open('https://www.walmart.com/search/?query=eco%20refill', '_blank')}
                        >
                          <span className="font-semibold">Buy eco-refill instead</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAddToReuse(suggestion)}
                          disabled={addingReuse === suggestion.title}
                        >
                          {addingReuse === suggestion.title ? 'Adding...' : 'Add to reuse list'}
                        </Button>
                      </div>
                      {reuseMsg && addingReuse === null && (
                        <div className="text-green-600 font-medium mt-2 animate-fade-in">{reuseMsg}</div>
                      )}
                      
                      {/* In-Store CTA Cards */}
                      <div className="mt-4 space-y-2">
                        <div className="bg-gradient-to-r from-[#0071CE]/10 to-[#0071CE]/5 border border-[#0071CE]/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="h-4 w-4 text-[#0071CE]" />
                            <span className="font-semibold text-[#0071CE]">Visit Walmart Store to Refill</span>
                          </div>
                          <p className="text-sm text-gray-600">Find eco-friendly refills and sustainable alternatives at your local Walmart</p>
                        </div>
                        <div className="bg-gradient-to-r from-[#FFC220]/10 to-[#FFC220]/5 border border-[#FFC220]/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-[#FFC220]" />
                            <span className="font-semibold text-[#FFC220]">Drop off at Store XYZ</span>
                          </div>
                          <p className="text-sm text-gray-600">Recycle this item at your nearest Walmart recycling center</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No suggestions found</h3>
                <p className="text-gray-600 mb-4">
                  Try analyzing a different item or check back later.
                </p>
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary/90">
                    Try Again
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/saved">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Saved Ideas
            </Button>
          </Link>
          <Link href="/local-recycling">
            <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Find Local Recycling
            </Button>
          </Link>
        </div>
      </main>

      {tutorialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setTutorialModal(null)}>
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-black">{tutorialModal.title} Tutorial</h3>
            {tutorialLoading ? <p className="text-black">Generating tutorial...</p> : (
              <pre className="bg-white rounded p-2 whitespace-pre-wrap text-sm text-black">{tutorialModal.tutorial}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 