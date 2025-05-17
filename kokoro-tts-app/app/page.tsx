"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, Volume2, Wand2, Save, Copy, Trash2, Info, Play, Pause } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SavedText {
  id: string
  text: string
  date: string
}

interface SavedAudio {
  id: string
  title: string
  text: string
  audioUrl: string
  date: string
  voice: string
  speed: number
  pitch: number
}

interface VoiceOption {
  id: string
  name: string
  accent: string
}

export default function Home() {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("input")
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState("default")
  const [savedTexts, setSavedTexts] = useLocalStorage<SavedText[]>("saved-texts", [])
  const [savedAudios, setSavedAudios] = useLocalStorage<SavedAudio[]>("saved-audios", [])
  const [libraryTab, setLibraryTab] = useState<"texts" | "audios">("audios")
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showDemo, setShowDemo] = useState(true)

  const voices: VoiceOption[] = [
    { id: "default", name: "Default", accent: "American" },
    { id: "emma", name: "Emma", accent: "British" },
    { id: "james", name: "James", accent: "American" },
    { id: "sophia", name: "Sophia", accent: "Australian" },
    { id: "liam", name: "Liam", accent: "Irish" },
  ]

  useEffect(() => {
    setCharacterCount(text.length)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    setIsTyping(true)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [text])

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = speed
    }
  }, [speed, audioUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed,
          pitch,
        }),
      })

      if (!response.ok) {
        throw new Error("Speech generation failed")
      }

      const data = await response.json()
      setAudioUrl(data.audioUrl)
      setActiveTab("preview")

      // Save the generated audio to library
      const title = createTitle(text)
      const newAudio: SavedAudio = {
        id: Date.now().toString(),
        title,
        text,
        audioUrl: data.audioUrl,
        date: new Date().toLocaleString(),
        voice: selectedVoice,
        speed,
        pitch,
      }

      setSavedAudios((prev) => [newAudio, ...prev])

      toast({
        title: "Success",
        description: "Audio generated and saved to library!",
      })
    } catch (err) {
      setError("An error occurred. Please try again.")
      toast({
        title: "Error",
        description: "Failed to generate audio",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const createTitle = (text: string) => {
    // Create a title from the first few words of the text
    const words = text.trim().split(/\s+/)
    const titleWords = words.slice(0, 4)
    let title = titleWords.join(" ")

    // Add ellipsis if the text is longer than 4 words
    if (words.length > 4) {
      title += "..."
    }

    return title
  }

  const handleSaveText = () => {
    if (!text.trim()) return

    const newSavedText: SavedText = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString(),
    }

    setSavedTexts([newSavedText, ...savedTexts])
    toast({
      title: "Saved",
      description: "Text saved to your library",
    })
  }

  const handleLoadText = (savedText: SavedText) => {
    setText(savedText.text)
    setActiveTab("input")
  }

  const handleDeleteText = (id: string) => {
    setSavedTexts(savedTexts.filter((item) => item.id !== id))
    toast({
      title: "Deleted",
      description: "Text removed from your library",
    })
  }

  const handleDeleteAudio = (id: string) => {
    setSavedAudios(savedAudios.filter((item) => item.id !== id))
    if (playingAudioId === id) {
      setPlayingAudioId(null)
      setIsPlaying(false)
    }
    toast({
      title: "Deleted",
      description: "Audio removed from your library",
    })
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handlePlaySavedAudio = (audio: SavedAudio) => {
    // If the same audio is already playing, pause it
    if (playingAudioId === audio.id && isPlaying) {
      const audioElement = document.getElementById(`audio-${audio.id}`) as HTMLAudioElement
      if (audioElement) {
        audioElement.pause()
        setIsPlaying(false)
        setPlayingAudioId(null)
      }
      return
    }

    // If another audio is playing, pause it first
    if (playingAudioId && playingAudioId !== audio.id) {
      const prevAudioElement = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement
      if (prevAudioElement) {
        prevAudioElement.pause()
      }
    }

    // Play the selected audio
    const audioElement = document.getElementById(`audio-${audio.id}`) as HTMLAudioElement
    if (audioElement) {
      audioElement.play()
      setIsPlaying(true)
      setPlayingAudioId(audio.id)

      // Add event listener for when audio ends
      audioElement.onended = () => {
        setIsPlaying(false)
        setPlayingAudioId(null)
      }
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const a = document.createElement("a")
    a.href = audioUrl
    a.download = `tts-audio-${Date.now()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Downloaded",
      description: "Audio file downloaded successfully",
    })
  }

  const handleDownloadSavedAudio = (audio: SavedAudio) => {
    const a = document.createElement("a")
    a.href = audio.audioUrl
    a.download = `${audio.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Downloaded",
      description: "Audio file downloaded successfully",
    })
  }

  const dismissDemo = () => {
    setShowDemo(false)
    localStorage.setItem("demo-dismissed", "true")
  }

  useEffect(() => {
    const isDismissed = localStorage.getItem("demo-dismissed") === "true"
    setShowDemo(!isDismissed)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <TooltipProvider>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {showDemo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-4 relative"
            >
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={dismissDemo}>
                ×
              </Button>
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-300">Demo Mode</h3>
                  <p className="text-sm text-blue-400 mt-1">
                    This is a prototype demonstration. The audio generation is currently simulated. In the final
                    version, it will connect to Kokoro TTS for real speech synthesis.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <Card className="border-slate-700 bg-slate-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold">Interactive Text-to-Speech</CardTitle>
                  <CardDescription className="text-slate-100 text-lg">
                    Convert your text into natural-sounding speech
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                  Prototype
                </Badge>
              </div>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700 text-slate-400">
                  <TabsTrigger
                    value="input"
                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    disabled={!audioUrl}
                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    Audio Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="library"
                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    My Library
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="input" className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Enter your text</h3>
                      <span className={`text-sm ${characterCount > 500 ? "text-amber-400" : "text-slate-400"}`}>
                        {characterCount}/1000 characters
                      </span>
                    </div>

                    <Textarea
                      placeholder="Type or paste text here to convert to speech..."
                      className="min-h-[200px] resize-none text-base bg-slate-700 border-slate-600 placeholder:text-slate-400"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={1000}
                    />

                    {isTyping && (
                      <div className="text-sm text-slate-400">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                          <Wand2 className="h-4 w-4 mr-2" />
                          Analyzing text...
                        </motion.div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Voice</label>
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {voices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                {voice.name} ({voice.accent})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Speed: {speed.toFixed(1)}x</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-700 border-slate-600">
                              <p className="w-[200px] text-xs">Adjust the speaking rate of the voice</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[speed]}
                          min={0.5}
                          max={2}
                          step={0.1}
                          onValueChange={(value) => {
                            if (value[0] !== speed) {
                              setSpeed(value[0])
                            }
                          }}
                          className="py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Pitch: {pitch.toFixed(1)}</label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-700 border-slate-600">
                            <p className="w-[200px] text-xs">Adjust how high or low the voice sounds</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Slider
                        value={[pitch]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={(value) => {
                          if (value[0] !== pitch) {
                            setPitch(value[0])
                          }
                        }}
                        className="py-2"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6">
                    <Button
                      type="submit"
                      disabled={isLoading || !text.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Generate Speech
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveText}
                      disabled={!text.trim()}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Text
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyText}
                      disabled={!text.trim()}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                {audioUrl ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Generated Audio</h3>
                      <audio
                        ref={audioRef}
                        controls
                        className="w-full"
                        onPlay={() => {
                          if (!isPlaying) setIsPlaying(true)
                        }}
                        onPause={() => {
                          if (isPlaying) setIsPlaying(false)
                        }}
                      >
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleAudioPlay} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {isPlaying ? "Pause" : "Play"}
                      </Button>

                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>

                      <Button
                        onClick={() => setActiveTab("input")}
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        Edit Text
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p>No audio generated yet. Go to Text Input to create one.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="library" className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">My Library</h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={libraryTab === "audios" ? "default" : "outline"}
                        onClick={() => setLibraryTab("audios")}
                        className={
                          libraryTab === "audios"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-slate-600 hover:bg-slate-700"
                        }
                      >
                        Audio Files
                      </Button>
                      <Button
                        size="sm"
                        variant={libraryTab === "texts" ? "default" : "outline"}
                        onClick={() => setLibraryTab("texts")}
                        className={
                          libraryTab === "texts"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-slate-600 hover:bg-slate-700"
                        }
                      >
                        Saved Texts
                      </Button>
                    </div>
                  </div>

                  {libraryTab === "audios" ? (
                    savedAudios.length > 0 ? (
                      <div className="space-y-4">
                        {savedAudios.map((audio) => (
                          <motion.div
                            key={audio.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-700 p-4 rounded-lg"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{audio.title}</h4>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {audio.date} • {voices.find((v) => v.id === audio.voice)?.name || audio.voice} •
                                    Speed: {audio.speed.toFixed(1)}x
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAudio(audio.id)}
                                  className="hover:bg-slate-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <audio id={`audio-${audio.id}`} className="hidden">
                                <source src={audio.audioUrl} type="audio/mpeg" />
                              </audio>

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-slate-600 hover:bg-slate-700"
                                  onClick={() => handlePlaySavedAudio(audio)}
                                >
                                  {playingAudioId === audio.id && isPlaying ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Play
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadSavedAudio(audio)}
                                  className="border-slate-600 hover:bg-slate-700"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setText(audio.text)
                                    setSelectedVoice(audio.voice)
                                    setSpeed(audio.speed)
                                    setPitch(audio.pitch)
                                    setActiveTab("input")
                                  }}
                                  className="border-slate-600 hover:bg-slate-700"
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <p>No audio files yet. Generate some speech from the Text Input tab.</p>
                      </div>
                    )
                  ) : savedTexts.length > 0 ? (
                    <div className="space-y-4">
                      {savedTexts.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-slate-700 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="line-clamp-2">{item.text}</p>
                              <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLoadText(item)}
                                className="hover:bg-slate-600"
                              >
                                Load
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteText(item.id)}
                                className="hover:bg-slate-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p>No saved texts yet. Save some text from the Text Input tab.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <CardFooter className="bg-slate-900 p-6 border-t border-slate-700">
              <div className="w-full">
                <p className="text-sm text-slate-400 mb-2">
                  This application uses advanced AI to convert text into natural-sounding speech. You can adjust voice,
                  speed, and pitch to customize your audio output.
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">Prototype Version 1.0</p>
                  <p className="text-xs text-slate-500">© 2023 Your Company</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </TooltipProvider>
    </main>
  )
}
