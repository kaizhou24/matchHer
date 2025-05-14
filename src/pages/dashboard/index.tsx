import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchProfile } from "@/components/match-profile"
import { Award, Calendar, ChevronRight, Clock, FileText, MessageSquare, PenLine, Settings, Users } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for demonstration
  const matchedMentor = {
    id: "user-alex-johnson-123",
    name: "Alex Johnson",
    role: "Senior Product Manager",
    bio: "Product leader with 8+ years of experience in tech. Passionate about mentoring the next generation of PMs and helping them navigate career growth.",
    pronouns: "he/him",
    company: "Google",
    avatar: "/placeholder.svg?height=64&width=64",
    skills: ["Resume Review", "Technical Interviews", "Career Transitions", "Product Management", "Leadership"],
    matchPercentage: 95,
    alignmentSummary:
      "You both share interests in product management and career development. Alex has experience in the areas you're looking to grow in, and you both value work-life balance and continuous learning.",
  }

  const upcomingMeetings = [
    { id: 1, title: "Career Planning Session", date: "May 15, 2025", time: "3:00 PM", partner: "Alex Johnson" },
    { id: 2, title: "Resume Review", date: "May 20, 2025", time: "4:30 PM", partner: "Alex Johnson" },
  ]

  const recentMessages = [
    { id: 1, sender: "Alex Johnson", message: "Looking forward to our meeting tomorrow!", time: "Yesterday" },
    {
      id: 2,
      sender: "Alex Johnson",
      message: "I've shared some resources for you to review before our session.",
      time: "2 days ago",
    },
  ]

  const badges = [
    { id: 1, name: "First Connection", icon: <Users className="h-6 w-6" />, achieved: true },
    { id: 2, name: "5 Meetings Streak", icon: <Calendar className="h-6 w-6" />, achieved: true },
    { id: 3, name: "Feedback Champion", icon: <FileText className="h-6 w-6" />, achieved: false },
    { id: 4, name: "Resource Sharer", icon: <FileText className="h-6 w-6" />, achieved: false },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">MentorMatch</span>
          </div>
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium text-pink-500">
              Dashboard
            </Link>
            <Link href="/dashboard/meetings" className="text-sm font-medium hover:text-pink-500">
              Meetings
            </Link>
            <Link href="/dashboard/messages" className="text-sm font-medium hover:text-pink-500">
              Messages
            </Link>
            <Link href="/dashboard/notes" className="text-sm font-medium hover:text-pink-500">
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
              <h1 className="text-3xl font-bold">
                {activeTab === "overview" && "Welcome back, Jordan"}
                {activeTab === "meetings" && "Your Meetings"}
                {activeTab === "messages" && "Your Messages"}
                {activeTab === "progress" && "Your Progress"}
              </h1>
              <p className="text-gray-500">
                {activeTab === "overview" && "Here's what's happening with your mentorship journey"}
                {activeTab === "meetings" && "Manage your scheduled mentorship sessions"}
                {activeTab === "messages" && "Stay connected with your mentors and mentees"}
                {activeTab === "progress" && "Track your growth and achievements"}
              </p>
            </div>
            <Link href="/dashboard/meetings">
              <Button className="bg-pink-500 hover:bg-pink-600">Schedule Meeting</Button>
            </Link>
          </div>

          <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-medium">Your Mentor Match</CardTitle>
                      <Users className="h-5 w-5 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                      <MatchProfile user={matchedMentor} />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Upcoming Meetings</CardTitle>
                    <Calendar className="h-5 w-5 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    {upcomingMeetings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingMeetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{meeting.title}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{meeting.date}</span>
                                <Clock className="h-3.5 w-3.5 ml-2" />
                                <span>{meeting.time}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming meetings</p>
                    )}
                    <div className="mt-4">
                      <Link href="/dashboard/meetings">
                        <Button variant="outline" className="w-full">
                          Schedule Meeting
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Messages</CardTitle>
                    <MessageSquare className="h-5 w-5 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    {recentMessages.length > 0 ? (
                      <div className="space-y-4">
                        {recentMessages.map((message) => (
                          <div key={message.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>AJ</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{message.sender}</p>
                                <p className="text-xs text-gray-500">{message.time}</p>
                              </div>
                              <p className="text-sm text-gray-500">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No recent messages</p>
                    )}
                    <div className="mt-4">
                      <Link href="/dashboard/messages">
                        <Button variant="outline" className="w-full">
                          View All Messages
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Notes</CardTitle>
                    <CardDescription>Your recent meeting reflections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-pink-100 p-2">
                          <PenLine className="h-4 w-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-medium">Career Planning Session</p>
                          <p className="text-sm text-gray-500">May 8, 2025</p>
                          <p className="mt-1 text-sm">
                            Discussed short-term goals and identified key skills to develop...
                          </p>
                          <Button variant="link" className="h-auto p-0 text-pink-500">
                            Read more
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-pink-100 p-2">
                          <PenLine className="h-4 w-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-medium">Resume Review</p>
                          <p className="text-sm text-gray-500">May 1, 2025</p>
                          <p className="mt-1 text-sm">
                            Identified areas for improvement in resume structure and content...
                          </p>
                          <Button variant="link" className="h-auto p-0 text-pink-500">
                            Read more
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/dashboard/notes">
                        <Button variant="outline" className="w-full">
                          View All Notes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Achievements</CardTitle>
                    <CardDescription>Badges and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">Weekly Check-in Streak</p>
                        <p className="text-sm font-medium">2/4 weeks</p>
                      </div>
                      <Progress value={50} className="h-2 bg-pink-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {badges.map((badge) => (
                        <div
                          key={badge.id}
                          className={`flex flex-col items-center justify-center rounded-lg border p-4 ${
                            badge.achieved ? "border-pink-200 bg-pink-50" : "border-gray-200 bg-gray-50 opacity-60"
                          }`}
                        >
                          <div className={`rounded-full p-2 ${badge.achieved ? "bg-pink-100" : "bg-gray-100"}`}>
                            <div className={badge.achieved ? "text-pink-500" : "text-gray-400"}>{badge.icon}</div>
                          </div>
                          <p className="mt-2 text-center text-sm font-medium">{badge.name}</p>
                          {badge.achieved && <Award className="mt-1 h-4 w-4 text-pink-500" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link href="/dashboard/achievements">
                        <Button variant="outline" className="w-full">
                          View All Achievements
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Manage your scheduled mentorship sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-pink-100 p-3">
                            <Calendar className="h-5 w-5 text-pink-500" />
                          </div>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{meeting.date}</span>
                              <Clock className="h-3.5 w-3.5 ml-2" />
                              <span>{meeting.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">With {meeting.partner}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Link href="/dashboard/meetings">
                      <Button className="bg-pink-500 hover:bg-pink-600">Schedule New Meeting</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>Your message threads with mentors and mentees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alex Johnson" />
                          <AvatarFallback>AJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Alex Johnson</p>
                          <p className="text-sm text-gray-500">I&#39;ve shared some resources for you to review...</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">2 days ago</span>
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs text-white">
                          2
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/messages">
                      <Button variant="outline" className="w-full">
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Progress</CardTitle>
                  <CardDescription>Track your growth and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">Goal Completion</p>
                        <p className="text-sm font-medium">2/5 completed</p>
                      </div>
                      <Progress value={40} className="h-2 bg-pink-100" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">Meeting Attendance</p>
                        <p className="text-sm font-medium">100%</p>
                      </div>
                      <Progress value={100} className="h-2 bg-pink-100" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">Resource Utilization</p>
                        <p className="text-sm font-medium">60%</p>
                      </div>
                      <Progress value={60} className="h-2 bg-pink-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
