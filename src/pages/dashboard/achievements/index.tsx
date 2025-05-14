import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  FlameIcon as Fire,
  Gift,
  LightbulbIcon,
  Settings,
  Star,
  Trophy,
  Users,
} from "lucide-react"

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState("badges")

  useEffect(() => {
    console.log("Current active tab:", activeTab)
  }, [activeTab])

  // Mock data for demonstration
  const badges = [
    {
      id: 1,
      name: "First Connection",
      description: "Successfully connected with your first mentor/mentee",
      icon: <Users className="h-6 w-6" />,
      achieved: true,
      date: "May 1, 2025",
    },
    {
      id: 2,
      name: "Meeting Master",
      description: "Completed 5 mentorship meetings",
      icon: <Calendar className="h-6 w-6" />,
      achieved: true,
      date: "May 10, 2025",
    },
    {
      id: 3,
      name: "Resource Sharer",
      description: "Shared 3 valuable resources with your mentor/mentee",
      icon: <Gift className="h-6 w-6" />,
      achieved: true,
      date: "May 12, 2025",
    },
    {
      id: 4,
      name: "Feedback Champion",
      description: "Provided constructive feedback on 3 occasions",
      icon: <Star className="h-6 w-6" />,
      achieved: false,
      progress: 67,
    },
    {
      id: 5,
      name: "Goal Achiever",
      description: "Completed 3 mentorship goals",
      icon: <CheckCircle className="h-6 w-6" />,
      achieved: false,
      progress: 33,
    },
    {
      id: 6,
      name: "Consistent Communicator",
      description: "Maintained regular communication for 4 weeks straight",
      icon: <Fire className="h-6 w-6" />,
      achieved: false,
      progress: 75,
    },
    {
      id: 7,
      name: "Knowledge Guru",
      description: "Shared expertise on 5 different topics",
      icon: <LightbulbIcon className="h-6 w-6" />,
      achieved: false,
      progress: 40,
    },
    {
      id: 8,
      name: "Mentorship Champion",
      description: "Completed a full 3-month mentorship program",
      icon: <Trophy className="h-6 w-6" />,
      achieved: false,
      progress: 25,
    },
  ]

  const streaks = [
    {
      id: 1,
      name: "Weekly Check-ins",
      current: 2,
      best: 4,
      target: 4,
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      id: 2,
      name: "Daily Messages",
      current: 3,
      best: 5,
      target: 7,
      icon: <Clock className="h-6 w-6" />,
    },
    {
      id: 3,
      name: "Goal Completion",
      current: 2,
      best: 2,
      target: 5,
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ]

  const achievements = [
    {
      id: 1,
      name: "First Meeting Completed",
      date: "May 1, 2025",
      description: "You completed your first mentorship meeting",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 2,
      name: "First Badge Earned",
      date: "May 1, 2025",
      description: "You earned your first badge: First Connection",
      icon: <Award className="h-5 w-5" />,
    },
    {
      id: 3,
      name: "Resume Reviewed",
      date: "May 8, 2025",
      description: "Your mentor reviewed and provided feedback on your resume",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 4,
      name: "5 Meetings Milestone",
      date: "May 10, 2025",
      description: "You've completed 5 mentorship meetings",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      id: 5,
      name: "Resource Sharing Badge",
      date: "May 12, 2025",
      description: "You earned the Resource Sharer badge",
      icon: <Gift className="h-5 w-5" />,
    },
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
            <Link href="/dashboard" className="text-sm font-medium hover:text-pink-500">
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
            <Link href="/dashboard/achievements" className="text-sm font-medium text-pink-500">
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
              <h1 className="text-3xl font-bold">Achievements & Streaks</h1>
              <p className="text-gray-500">
                {activeTab === "badges" && "Earn badges by reaching mentorship milestones"}
                {activeTab === "streaks" && "Keep your momentum going with daily streaks"}
                {activeTab === "timeline" && "View your mentorship journey timeline"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="badges" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="m-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {badges.map((badge) => (
                  <Card key={badge.id} className={badge.achieved ? "border-pink-200" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center">
                        <div
                          className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                            badge.achieved ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {badge.icon}
                        </div>
                        {badge.achieved ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-pink-500" />
                            <span className="text-gray-500">Earned on {badge.date}</span>
                          </div>
                        ) : (
                          <div className="w-full space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="streaks" className="m-0">
              <div className="grid gap-6 md:grid-cols-3">
                {streaks.map((streak) => (
                  <Card key={streak.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="rounded-full bg-pink-100 p-2 text-pink-500">{streak.icon}</div>
                        {streak.name}
                      </CardTitle>
                      <CardDescription>Keep your streak going to earn badges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Current Streak</p>
                            <div className="flex items-center gap-1">
                              <Fire className="h-5 w-5 text-pink-500" />
                              <span className="text-2xl font-bold">{streak.current}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Best Streak</p>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-5 w-5 text-pink-500" />
                              <span className="text-2xl font-bold">{streak.best}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Target</p>
                            <div className="flex items-center gap-1">
                              <Crown className="h-5 w-5 text-pink-500" />
                              <span className="text-2xl font-bold">{streak.target}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{Math.round((streak.current / streak.target) * 100)}%</span>
                          </div>
                          <Progress value={(streak.current / streak.target) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Streak Calendar</CardTitle>
                  <CardDescription>Your activity over the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      // Simulate some random activity
                      const hasActivity = Math.random() > 0.5
                      const intensity = hasActivity ? Math.floor(Math.random() * 3) + 1 : 0
                      const day = 30 - i
                      const isToday = day === 15

                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded ${
                            intensity === 0
                              ? "bg-gray-100"
                              : intensity === 1
                                ? "bg-pink-100"
                                : intensity === 2
                                  ? "bg-pink-300"
                                  : "bg-pink-500"
                          } ${isToday ? "ring-2 ring-pink-500" : ""}`}
                          title={`May ${day}, 2025`}
                        ></div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-100"></div>
                      <span className="text-sm text-gray-500">No activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-pink-100"></div>
                      <span className="text-sm text-gray-500">Light</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-pink-300"></div>
                      <span className="text-sm text-gray-500">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-pink-500"></div>
                      <span className="text-sm text-gray-500">High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Timeline</CardTitle>
                  <CardDescription>Your mentorship journey milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-gray-200 pl-6 ml-3">
                    {achievements.map((achievement, index) => (
                      <div key={achievement.id} className="mb-10 last:mb-0">
                        <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-500 ring-8 ring-white">
                          {achievement.icon}
                        </div>
                        <div className="flex flex-col">
                          <time className="mb-1 text-sm font-normal text-gray-400">{achievement.date}</time>
                          <h3 className="text-lg font-semibold text-gray-900">{achievement.name}</h3>
                          <p className="mb-4 text-base font-normal text-gray-500">{achievement.description}</p>
                          {index === 0 && (
                            <Button variant="outline" className="w-fit">
                              View Meeting Notes
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
