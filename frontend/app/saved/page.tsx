"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Trash2, Share2, Zap, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore"

export default function SavedPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [detailsIdea, setDetailsIdea] = useState<any | null>(null)
  const [tutorialIdea, setTutorialIdea] = useState<any | null>(null)
  const [tutorial, setTutorial] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null)
  const [loadingTutorial, setLoadingTutorial] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const filterRef = useRef<HTMLDivElement>(null)

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "diys"), (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  // Click outside to close filter
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [filterOpen])

  // Delete idea
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "diys", id))
  }

  // Helper to fetch AI tutorial
  const fetchTutorial = async (idea: any) => {
    setLoadingTutorial(true)
    setTutorial(null)
    setYoutubeUrl(null)
    try {
      const res = await fetch("/api/generate-tutorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: idea.title, description: idea.description })
      })
      const data = await res.json()
      setTutorial(data.tutorial)
    } catch (e) {
      setTutorial("Failed to generate tutorial.")
    }
    try {
      const ytRes = await fetch(`/api/youtube?q=${encodeURIComponent(idea.title + ' diy tutorial')}`)
      const ytData = await ytRes.json()
      setYoutubeUrl(ytData.url)
    } catch (e) {
      setYoutubeUrl(null)
    }
    setLoadingTutorial(false)
  }

  // Filtering logic
  const filteredIdeas = ideas.filter(idea => {
    const difficultyMatch = selectedDifficulties.length === 0 || selectedDifficulties.includes((idea.difficulty || '').toLowerCase())
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes((idea.type || '').toLowerCase())
    return difficultyMatch && typeMatch
  })

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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Your Saved Ideas</h2>
            <p className="text-black">All your favorite reuse and recycling ideas in one place</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search saved ideas..."
                className="pl-10"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <Button variant="outline" className="sm:w-auto" onClick={() => setFilterOpen(v => !v)}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                  <div className="mb-2 font-semibold text-black">Difficulty</div>
                  <div className="flex flex-col gap-1 mb-4">
                    {['easy', 'medium', 'hard'].map(diff => (
                      <label key={diff} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDifficulties.includes(diff)}
                          onChange={e => {
                            setSelectedDifficulties(prev =>
                              e.target.checked
                                ? [...prev, diff]
                                : prev.filter(d => d !== diff)
                            )
                          }}
                        />
                        <span className="capitalize text-black">{diff}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mb-2 font-semibold text-black">Type</div>
                  <div className="flex flex-col gap-1 mb-4">
                    {['upcycle', 'reuse', 'recycle'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={e => {
                            setSelectedTypes(prev =>
                              e.target.checked
                                ? [...prev, type]
                                : prev.filter(t => t !== type)
                            )
                          }}
                        />
                        <span className="capitalize text-black">{type}</span>
                      </label>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => { setSelectedDifficulties([]); setSelectedTypes([]); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Saved Ideas Grid */}
          <div className="grid gap-6 mb-12">
            {filteredIdeas.length > 0 ? filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={idea.type === 'reuse' ? 'default' : idea.type === 'recycle' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {idea.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {idea.difficulty}
                        </Badge>
                        {idea.savedDate && (
                          <span className="text-sm text-gray-500">
                            Saved {idea.savedDate}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl">{idea.title}</CardTitle>
                      <CardDescription className="text-sm">
                        From: {idea.productName}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(idea.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{idea.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setDetailsIdea(idea)}>
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setTutorialIdea(idea); fetchTutorial(idea); }}>
                      View Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center text-gray-500">No saved ideas yet.</div>
            )}
          </div>

          {/* Details Modal */}
          {detailsIdea && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-500" onClick={() => setDetailsIdea(null)}>
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold mb-2 text-black">{detailsIdea.title}</h3>
                <p className="mb-2 text-black"><b>Type:</b> {detailsIdea.type}</p>
                <p className="mb-2 text-black"><b>Difficulty:</b> {detailsIdea.difficulty}</p>
                <p className="mb-2 text-black"><b>Description:</b> {detailsIdea.description}</p>
                <p className="mb-2 text-black"><b>From:</b> {detailsIdea.productName}</p>
                {/* Add more fields as needed */}
              </div>
            </div>
          )}

          {/* Tutorial Modal */}
          {tutorialIdea && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
                <button className="absolute top-2 right-2 text-gray-500" onClick={() => { setTutorialIdea(null); setTutorial(null); setYoutubeUrl(null); }}>
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold mb-4 text-black">{tutorialIdea.title} Tutorial</h3>
                {loadingTutorial && <p className="text-black">Generating tutorial...</p>}
                {tutorial && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-black">AI-Generated Steps:</h4>
                    <pre className="bg-white rounded p-2 whitespace-pre-wrap text-sm text-black">{tutorial}</pre>
                  </div>
                )}
                {youtubeUrl && (
                  <div>
                    <h4 className="font-semibold mb-2 text-black">YouTube Video:</h4>
                    <iframe width="100%" height="250" src={youtubeUrl} frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Counter at the bottom */}
          <div className="fixed bottom-0 left-0 w-full bg-white shadow p-4 flex justify-center gap-4">
            <span className="text-lg font-bold text-black">{filteredIdeas.length}</span>
            <span className="text-black">Saved Ideas</span>
          </div>
        </div>
      </main>
    </div>
  )
} 