"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Phone, Globe, Zap, ArrowLeft, Recycle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const STATIC_TIPS = [
  'Properly rinse and clean all recyclable materials before disposing.',
  'Separate your waste into different categories: paper, plastic, metal, glass, etc.',
  'Check the GHMC website for the latest updates on recycling programs and collection schedules in your area.',
  'Avoid contaminating recyclable materials with food waste or other non-recyclable items.',
  'Compact cardboard boxes to save space and improve efficiency.',
  'For bulky items like old furniture or electronics, contact the GHMC for their e-waste or bulk waste collection services.',
  "Participate in GHMC's community recycling drives when announced.",
  'Use reusable bags and containers to minimize waste generation.'
]

export default function LocalRecyclingPage() {
  const [zipcode, setZipcode] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!zipcode) return
    setLoading(true)
    setError(null)
    setSearchResults(null)
    try {
      const res = await fetch('/api/recycling-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: zipcode })
      })
      const data = await res.json()
      setSearchResults(data)
    } catch (e) {
      setError('Failed to fetch recycling info.')
    }
    setLoading(false)
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Local Recycling Guide</h2>
            <p className="text-gray-600">Find recycling centers and tips near you</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find Recycling Near You
              </CardTitle>
              <CardDescription>
                Enter your ZIP code to discover recycling centers and tips in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter ZIP code (e.g., 12345)"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searchResults && (
            <div className="space-y-8">
              {/* Recycling Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Recycle className="h-5 w-5 text-green-600" />
                    Recycling Tips for {searchResults.zipcode}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {STATIC_TIPS.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-900">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recycling Centers */}
              {searchResults.centers && searchResults.centers.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-black">Nearby Recycling Centers</h3>
                  <div className="grid gap-4">
                    {searchResults.centers.map((center: any, index: number) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold mb-1 text-white">{center.name}</h4>
                              {center.address && (
                                <p className="text-sm mb-2 text-white">{center.address}</p>
                              )}
                              {center.phone && (
                                <div className="flex items-center gap-4 text-sm text-white">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {center.distance || ''}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {center.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                            {center.distance && (
                              <Badge variant="outline" className="text-xs text-white border-white">{center.distance}</Badge>
                            )}
                          </div>
                          <div className="space-y-3">
                            {center.accepts && (
                              <div>
                                <h5 className="font-medium text-sm mb-2 text-white">Accepts:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {center.accepts.map((item: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs text-white border-white">{item}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              {center.phone && (
                                <Button size="sm" variant="outline" className="flex-1 text-white border-white">
                                  <Phone className="h-3 w-3 mr-1" />
                                  Call
                                </Button>
                              )}
                              {center.website && (
                                <Button size="sm" variant="outline" className="flex-1 text-white border-white" asChild>
                                  <a href={center.website} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Website
                                  </a>
                                </Button>
                              )}
                              {center.directions && (
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" asChild>
                                  <a href={center.directions} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Directions
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Tips */}
          {!searchResults && (
            <Card>
              <CardHeader>
                <CardTitle>General Recycling Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Clean Before Recycling</h4>
                      <p className="text-sm text-gray-600">Rinse containers to remove food residue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Check Local Guidelines</h4>
                      <p className="text-sm text-gray-600">Recycling rules vary by location</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Walmart Recycling</h4>
                      <p className="text-sm text-gray-600">Many Walmart locations accept plastic bags and electronics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
} 