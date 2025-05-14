import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Settings, Users } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

export default function MeetingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedMeetingType, setSelectedMeetingType] = useState<string | null>(null)
  const [showMentorAvailability, setShowMentorAvailability] = useState(true)
  const [syncWithCalendar, setSyncWithCalendar] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Mock data for demonstration
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  // Mock mentor availability
  const mentorAvailability = {
    "9:00 AM": true,
    "10:00 AM": false,
    "11:00 AM": true,
    "1:00 PM": true,
    "2:00 PM": false,
    "3:00 PM": true,
    "4:00 PM": true,
    "5:00 PM": false,
  }

  const upcomingMeetings = [
    {
      id: 1,
      title: "Career Planning Session",
      date: "May 15, 2025",
      time: "3:00 PM - 4:00 PM",
      partner: "Alex Johnson",
      description: "Discuss career goals and create an action plan for the next quarter.",
    },
    {
      id: 2,
      title: "Resume Review",
      date: "May 20, 2025",
      time: "4:30 PM - 5:30 PM",
      partner: "Alex Johnson",
      description: "Review updated resume and provide feedback on improvements.",
    },
  ]

  const meetingTypes = [
    { id: "career-planning", name: "Career Planning" },
    { id: "resume-review", name: "Resume Review" },
    { id: "interview-prep", name: "Interview Preparation" },
    { id: "skill-development", name: "Skill Development" },
    { id: "general-advice", name: "General Advice" },
    { id: "other", name: "Other" },
  ]

  const handleScheduleMeeting = async () => {
    if (!date || !selectedTime || !title || !selectedMeetingType) {
      // Show error message
      alert("Please fill in all required fields.")
      return
    }

    // Parse the selected date and time
    const [hours, minutes] = selectedTime.replace(/[APM]/g, '').trim().split(':')
    let hour = parseInt(hours)
    if (selectedTime.includes('PM') && hour !== 12) {
      hour += 12
    } else if (selectedTime.includes('AM') && hour === 12) {
      hour = 0
    }

    const startDate = new Date(date)
    startDate.setHours(hour, parseInt(minutes), 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + 1) // 1 hour meeting

    if (syncWithCalendar) {
      try {
        const response = await fetch('/api/calendar/test', {
          method: 'GET'
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to sync with calendar');
        }

        // Show success message
        alert('Meeting synced with Google Calendar! Check your calendar for details.');
      } catch (error) {
        console.error('Failed to sync with Google Calendar:', error);
        alert('Failed to sync with Google Calendar. Please try again.');
      }
    }

    setIsNewMeetingOpen(false);
    // Add meeting to local state
    const newMeeting = {
      id: upcomingMeetings.length + 1,
      title,
      type: meetingTypes.find((type) => type.id === selectedMeetingType)?.name || 'Other',
      date: format(date, 'MMM d, yyyy'),
      time: `${selectedTime} - ${format(endDate, 'h:mm a')}`,
      partner: "Alex Johnson", // This would come from your actual mentor/mentee data
      description: description || 'No description provided',
    };
    
    // In a real app, you'd update this in a database
    upcomingMeetings.push(newMeeting);
  }

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
            <Link href="/dashboard/meetings" className="text-sm font-medium text-pink-500">
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
              <h1 className="text-3xl font-bold">Meeting Scheduler</h1>
              <p className="text-gray-500">Plan and manage your mentorship sessions</p>
            </div>
            <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600">
                  <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Schedule a New Meeting</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to schedule a meeting with your mentor/mentee.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="meeting-type">Meeting Type</Label>
                    <Select onValueChange={setSelectedMeetingType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        {meetingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Career Planning Session"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Time</Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="show-availability" className="text-xs text-gray-500">
                            Show mentor availability
                          </Label>
                          <Switch
                            id="show-availability"
                            checked={showMentorAvailability}
                            onCheckedChange={setShowMentorAvailability}
                          />
                        </div>
                      </div>
                      <Select onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem
                              key={time}
                              value={time}
                              disabled={
                                showMentorAvailability && !mentorAvailability[time as keyof typeof mentorAvailability]
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span>{time}</span>
                                {showMentorAvailability && (
                                  <span
                                    className={`h-2 w-2 rounded-full ${mentorAvailability[time as keyof typeof mentorAvailability] ? "bg-green-500" : "bg-red-500"}`}
                                  ></span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Meeting Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What would you like to discuss in this meeting?"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sync-calendar"
                      checked={syncWithCalendar}
                      onCheckedChange={setSyncWithCalendar}
                    />
                    <Label htmlFor="sync-calendar">Sync with Google Calendar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="reminders" defaultChecked />
                    <Label htmlFor="reminders">Send reminders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="email-reminder" defaultChecked />
                    <Label htmlFor="email-reminder">Email reminder (24 hours before)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="text-reminder" />
                    <Label htmlFor="text-reminder">Text reminder (1 hour before)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewMeetingOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-pink-500 hover:bg-pink-600" onClick={handleScheduleMeeting}>
                    Schedule Meeting
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="text-lg font-medium">Calendar</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">May 2025</span>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="bg-white p-2 text-center text-sm font-medium">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - 3 + 1 // Adjust for May 2025 starting on a Thursday
                      const isCurrentMonth = day > 0 && day <= 31
                      const isToday = day === 15 // Assuming today is May 15
                      const hasMeeting = day === 15 || day === 20 // Meetings on May 15 and 20

                      // Highlight mentor availability
                      const mentorAvailable = [5, 6, 12, 13, 19, 20, 26, 27].includes(day)

                      return (
                        <div
                          key={i}
                          className={`relative min-h-[80px] bg-white p-1 ${
                            !isCurrentMonth ? "text-gray-300" : ""
                          } ${isToday ? "bg-pink-50" : ""} ${mentorAvailable && isCurrentMonth ? "bg-green-50" : ""}`}
                        >
                          <div className="flex justify-between">
                            <span className="text-sm">{isCurrentMonth ? day : ""}</span>
                            {hasMeeting && isCurrentMonth && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs text-white">
                                {day === 15 ? "1" : day === 20 ? "1" : ""}
                              </span>
                            )}
                          </div>
                          {hasMeeting && isCurrentMonth && (
                            <div className="mt-1 rounded bg-pink-100 p-1 text-xs text-pink-800">
                              {day === 15 ? "3:00 PM - Career Planning" : day === 20 ? "4:30 PM - Resume Review" : ""}
                            </div>
                          )}
                          {mentorAvailable && isCurrentMonth && !hasMeeting && (
                            <div className="mt-1 rounded bg-green-100 p-1 text-xs text-green-800">Mentor Available</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="border-t p-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                    <span>Your Meetings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Mentor Availability</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-4">
                  <h2 className="text-lg font-medium">Upcoming Meetings</h2>
                </div>
                <div className="divide-y">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">{meeting.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Meeting</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Cancel Meeting</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{meeting.date}</span>
                        <Clock className="ml-2 h-3.5 w-3.5" />
                        <span>{meeting.time}</span>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>AJ</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">With {meeting.partner}</span>
                      </div>
                      <p className="text-sm text-gray-500">{meeting.description}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <Button variant="outline" className="w-full">
                    View All Meetings
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-medium">Sync with Calendar</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Connect your Google Calendar to automatically sync your mentorship meetings.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/api/auth/google'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  Connect Google Calendar
                </Button>
              </div>

              <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-medium">Reminder Settings</h3>
                <p className="mb-4 text-sm text-gray-500">Customize how and when you receive meeting reminders.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-gray-500"
                      >
                        <rect width="18" height="14" x="3" y="5" rx="2" />
                        <polyline points="3 7 12 13 21 7" />
                      </svg>
                      <span className="text-sm">Email (24h before)</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-gray-500"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span className="text-sm">SMS (1h before)</span>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-gray-500"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      <span className="text-sm">Browser (15min before)</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
