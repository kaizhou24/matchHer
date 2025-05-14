import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Check, ChevronRight, Edit, FileText, PenLine, Plus, Search, Settings, Users } from "lucide-react"

interface MeetingNote {
  id: number
  title: string
  date: string
  partner: string
  content: string
  reflections: string
  tags: string[]
}

interface JournalEntry {
  id: number
  title: string
  date: string
  content: string
  mood: string
}

type Note = MeetingNote | JournalEntry

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState("meeting-notes")
  const [selectedNote, setSelectedNote] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Mock data for demonstration
  const meetingNotes = [
    {
      id: 1,
      title: "Career Planning Session",
      date: "May 15, 2025",
      partner: "Alex Johnson",
      content:
        "Discussed short-term goals and identified key skills to develop. Alex suggested focusing on project management certification and improving public speaking skills.\n\nKey takeaways:\n- Research PMI certification requirements\n- Join Toastmasters for public speaking practice\n- Read &apos;The Effective Executive&apos; by Peter Drucker\n\nNext steps:\n1. Create a study plan for PM certification\n2. Schedule first Toastmasters visit\n3. Set up bi-weekly check-ins on progress",
      reflections:
        "I feel much more confident about my career direction after this meeting. Having concrete steps makes the big goals seem more achievable.",
      tags: ["career-development", "skills", "goals"],
    },
    {
      id: 2,
      title: "Resume Review",
      date: "May 8, 2025",
      partner: "Alex Johnson",
      content:
        "Reviewed current resume and identified areas for improvement. Alex suggested reorganizing experience section to highlight achievements rather than responsibilities.\n\nKey feedback:\n- Add metrics to quantify impact in previous roles\n- Remove outdated skills section\n- Expand on leadership experience\n\nNext steps:\n1. Rewrite experience bullets with achievement focus\n2. Update skills section\n3. Send revised version for follow-up review",
      reflections:
        "The feedback was very constructive. I hadn't realized how much my resume focused on tasks rather than accomplishments.",
      tags: ["resume", "job-search"],
    },
    {
      id: 3,
      title: "Interview Preparation",
      date: "May 1, 2025",
      partner: "Alex Johnson",
      content:
        "Practiced common interview questions and received feedback on responses. Focused particularly on behavioral questions and the STAR method.\n\nKey points:\n- Need to be more concise in responses\n- Good use of specific examples\n- Work on body language and confidence\n\nNext steps:\n1. Practice 5 more behavioral questions\n2. Record a mock interview for self-review\n3. Research common technical questions for target roles",
      reflections:
        "The mock interview was harder than I expected, but very helpful. I need to work on being more concise while still telling a compelling story.",
      tags: ["interviews", "job-search"],
    },
  ]

  const journalEntries = [
    {
      id: 1,
      title: "Weekly Reflection",
      date: "May 14, 2025",
      content:
        "This week I made significant progress on my public speaking goals. I attended my first Toastmasters meeting and, while nervous, I participated in the table topics session. The feedback was encouraging.\n\nI also started studying for the PM certification and completed the first module. The content is challenging but interesting.\n\nThings I'm proud of this week:\n- Stepping out of my comfort zone at Toastmasters\n- Maintaining my study schedule\n- Reaching out to two new contacts on LinkedIn\n\nAreas to improve:\n- Need to better manage my time between work and study\n- Should practice more technical interview questions",
      mood: "Motivated",
    },
    {
      id: 2,
      title: "Goal Progress Check-in",
      date: "May 10, 2025",
      content:
        "Checking in on my quarterly goals:\n\n1. PM Certification: 15% complete - on track\n2. Networking: Connected with 5/10 target contacts - on track\n3. Public Speaking: Joined Toastmasters - on track\n4. Technical Skills: Completed 1/3 planned courses - falling behind\n\nI need to allocate more time to the technical skills portion of my development plan. Will adjust my schedule to dedicate two evenings per week specifically to this area.",
      mood: "Focused",
    },
  ]

  const selectedNoteData = activeTab === "meeting-notes"
    ? meetingNotes.find((note): note is MeetingNote => note.id === selectedNote)
    : journalEntries.find((entry): entry is JournalEntry => entry.id === selectedNote)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">MentorMatch</span>
          </div>
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium hover:text-pink-500">
              Dashboard
            </Link>
            <Link href="/dashboard/meetings" className="text-sm font-medium hover:text-pink-500">
              Meetings
            </Link>
            <Link href="/dashboard/messages" className="text-sm font-medium hover:text-pink-500">
              Messages
            </Link>
            <Link href="/dashboard/notes" className="text-sm font-medium text-pink-500">
              Notes
            </Link>
            <Link href="/dashboard/achievements" className="text-sm font-medium hover:text-pink-500">
              Achievements
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Meeting Notes & Journal</h1>
              <p className="text-gray-500">Track your progress and reflections</p>
            </div>
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </div>

          <Tabs defaultValue="meeting-notes" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:w-auto">
              <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
              <TabsTrigger value="journal">Personal Journal</TabsTrigger>
            </TabsList>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search notes..." className="pl-9" />
                  </div>
                </div>

                <TabsContent value="meeting-notes" className="m-0">
                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="border-b p-4">
                      <h2 className="font-medium">Meeting Notes</h2>
                    </div>
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {meetingNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedNote === note.id ? "bg-pink-50" : ""
                          }`}
                          onClick={() => setSelectedNote(note.id)}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-medium">{note.title}</h3>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{note.date}</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px]">AJ</AvatarFallback>
                              </Avatar>
                              <span>{note.partner}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="journal" className="m-0">
                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="border-b p-4">
                      <h2 className="font-medium">Journal Entries</h2>
                    </div>
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {journalEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedNote === entry.id ? "bg-pink-50" : ""
                          }`}
                          onClick={() => setSelectedNote(entry.id)}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="font-medium">{entry.title}</h3>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{entry.date}</span>
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-800">{entry.mood}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{entry.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>

              <div className="lg:col-span-2">
                {selectedNoteData ? (
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      {isEditing ? (
                        <Input defaultValue={selectedNoteData.title} className="text-xl font-bold" />
                      ) : (
                        <CardTitle>{selectedNoteData.title}</CardTitle>
                      )}
                      <div className="flex gap-2">
                        {isEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="text-green-600"
                          >
                            <Check className="mr-1 h-4 w-4" /> Save
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-1 h-4 w-4" /> Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{selectedNoteData.date}</span>
                        </div>
                        {activeTab === "meeting-notes" && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">AJ</AvatarFallback>
                            </Avatar>
                            <span>With {(selectedNoteData as MeetingNote)?.partner}</span>
                          </div>
                        )}
                        {activeTab === "journal" && (
                          <div className="flex items-center gap-1">
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-800">
                              {(selectedNoteData as JournalEntry)?.mood}
                            </span>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <Textarea defaultValue={selectedNoteData.content} className="min-h-[300px]" />
                      ) : (
                        <div className="whitespace-pre-line text-gray-700">{selectedNoteData.content}</div>
                      )}

                      {activeTab === "meeting-notes" && (
                        <>
                          <div>
                            <h3 className="mb-2 font-medium">Reflections</h3>
                            {isEditing ? (
                              <Textarea
                                defaultValue={(selectedNoteData as MeetingNote)?.reflections}
                                className="min-h-[100px]"
                                placeholder="What did you learn from this meeting? How do you feel about the progress made?"
                              />
                            ) : (
                              <div className="rounded-lg border bg-gray-50 p-4 text-gray-700">
                                {(selectedNoteData as MeetingNote)?.reflections}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="mb-2 font-medium">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {(selectedNoteData as MeetingNote)?.tags?.map((tag: string) => (
                                <span key={tag} className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-800">
                                  {tag}
                                </span>
                              ))}
                              {isEditing && (
                                <Button variant="outline" size="sm" className="h-7">
                                  <Plus className="mr-1 h-3 w-3" /> Add Tag
                                </Button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Export
                      </Button>
                      <Button className="bg-pink-500 hover:bg-pink-600">
                        <PenLine className="mr-2 h-4 w-4" /> Add Follow-up
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-white p-12 text-center shadow-sm">
                    <FileText className="mb-4 h-12 w-12 text-gray-300" />
                    <h3 className="mb-2 text-xl font-medium">No note selected</h3>
                    <p className="mb-6 text-gray-500">Select a note from the sidebar to view its contents</p>
                    <Button className="bg-pink-500 hover:bg-pink-600">
                      <Plus className="mr-2 h-4 w-4" /> Create New Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
