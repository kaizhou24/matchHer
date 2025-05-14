"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  FileText,
  ImageIcon,
  LinkIcon,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  Smile,
  Users,
} from "lucide-react"

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("conversations")
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1) // Default to first conversation
  const [messageText, setMessageText] = useState("")

  // Mock data for demonstration
  const conversations = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Senior Product Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "I've shared some resources for you to review before our next meeting.",
      time: "2:34 PM",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "UX Designer",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the feedback on my portfolio!",
      time: "Yesterday",
      unread: 0,
      online: false,
    },
  ]

  const messages = [
    {
      id: 1,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content: "Hi Jordan! How are you doing with the career planning exercises we discussed?",
      time: "10:30 AM",
      date: "Today",
    },
    {
      id: 2,
      conversationId: 1,
      sender: "You",
      isSelf: true,
      content: "Hi Alex! I've been working through them. The strengths assessment was particularly insightful.",
      time: "10:45 AM",
      date: "Today",
    },
    {
      id: 3,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content:
        "That's great to hear! I've shared some additional resources that might help you further refine your career goals.",
      time: "11:15 AM",
      date: "Today",
    },
    {
      id: 4,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content: "Here are the resources I mentioned:",
      time: "11:16 AM",
      date: "Today",
    },
    {
      id: 5,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content: "1. Career Development Framework.pdf",
      time: "11:16 AM",
      date: "Today",
      isFile: true,
      fileType: "pdf",
    },
    {
      id: 6,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content: "2. Industry Trends Report.pdf",
      time: "11:17 AM",
      date: "Today",
      isFile: true,
      fileType: "pdf",
    },
    {
      id: 7,
      conversationId: 1,
      sender: "Alex Johnson",
      isSelf: false,
      content:
        "I've also added these to our shared notebook. Let me know if you have any questions after reviewing them!",
      time: "11:20 AM",
      date: "Today",
    },
    {
      id: 8,
      conversationId: 2,
      sender: "Sarah Williams",
      isSelf: false,
      content: "Hi Jordan, I really appreciated your feedback on my UX portfolio yesterday.",
      time: "3:45 PM",
      date: "Yesterday",
    },
    {
      id: 9,
      conversationId: 2,
      sender: "You",
      isSelf: true,
      content:
        "Happy to help, Sarah! Your case studies were very well structured. I especially liked the problem-solution framework you used.",
      time: "4:30 PM",
      date: "Yesterday",
    },
    {
      id: 10,
      conversationId: 2,
      sender: "Sarah Williams",
      isSelf: false,
      content: "Thanks for the feedback on my portfolio!",
      time: "5:15 PM",
      date: "Yesterday",
    },
  ]

  const sharedResources = [
    {
      id: 1,
      name: "Career Development Framework",
      type: "PDF",
      sender: "Alex Johnson",
      date: "May 13, 2025",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Industry Trends Report",
      type: "PDF",
      sender: "Alex Johnson",
      date: "May 13, 2025",
      size: "3.8 MB",
    },
    {
      id: 3,
      name: "Resume Template",
      type: "DOCX",
      sender: "Alex Johnson",
      date: "May 5, 2025",
      size: "1.2 MB",
    },
    {
      id: 4,
      name: "UX Portfolio Examples",
      type: "ZIP",
      sender: "Sarah Williams",
      date: "May 2, 2025",
      size: "15.7 MB",
    },
  ]

  const notebooks = [
    {
      id: 1,
      name: "Career Development",
      lastUpdated: "May 13, 2025",
      collaborator: "Alex Johnson",
      itemCount: 8,
    },
    {
      id: 2,
      name: "UX Design Resources",
      lastUpdated: "May 2, 2025",
      collaborator: "Sarah Williams",
      itemCount: 5,
    },
  ]

  const filteredMessages = messages.filter((message) => message.conversationId === selectedConversation)
  const selectedConversationData = conversations.find((conv) => conv.id === selectedConversation)

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, you would send the message to your backend
      console.log("Sending message:", messageText)
      setMessageText("")
    }
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
            <Link href="/dashboard/meetings" className="text-sm font-medium hover:text-pink-500">
              Meetings
            </Link>
            <Link href="/dashboard/messages" className="text-sm font-medium text-pink-500">
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
                {activeTab === "conversations" && "Messages & Resources"}
                {activeTab === "resources" && "Shared Resources"}
                {activeTab === "notebooks" && "Shared Notebooks"}
              </h1>
              <p className="text-gray-500">
                {activeTab === "conversations" && "Stay connected with your mentors and mentees"}
                {activeTab === "resources" && "Access and manage shared learning materials"}
                {activeTab === "notebooks" && "Collaborate on notes and documentation"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="conversations" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="resources">Shared Resources</TabsTrigger>
              <TabsTrigger value="notebooks">Notebooks</TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="m-0">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search conversations..." className="pl-9" />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white shadow-sm">
                    <div className="border-b p-4">
                      <h2 className="font-medium">Recent Conversations</h2>
                    </div>
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedConversation === conversation.id ? "bg-pink-50" : ""
                          }`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                                <AvatarFallback>
                                  {conversation.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.online && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{conversation.name}</h3>
                                <span className="text-xs text-gray-500">{conversation.time}</span>
                              </div>
                              <p className="text-xs text-gray-500">{conversation.role}</p>
                              <p className="text-sm text-gray-700 truncate">{conversation.lastMessage}</p>
                            </div>
                            {conversation.unread > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs text-white">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <Card className="flex h-[700px] flex-col">
                      <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={selectedConversationData?.avatar || "/placeholder.svg"}
                              alt={selectedConversationData?.name}
                            />
                            <AvatarFallback>
                              {selectedConversationData?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{selectedConversationData?.name}</h3>
                            <div className="flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  selectedConversationData?.online ? "bg-green-500" : "bg-gray-300"
                                }`}
                              ></span>
                              <span className="text-xs text-gray-500">
                                {selectedConversationData?.online ? "Online" : "Offline"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-1 h-4 w-4" /> Schedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-1 h-4 w-4" /> Notes
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {filteredMessages.map((message, index) => {
                          // Check if we need to show a date separator
                          const showDate = index === 0 || filteredMessages[index - 1].date !== message.date

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex items-center justify-center my-4">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {message.date}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}>
                                <div className="max-w-[80%]">
                                  {!message.isSelf && (
                                    <div className="flex items-center gap-2 mb-1">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={selectedConversationData?.avatar || "/placeholder.svg"}
                                          alt={message.sender}
                                        />
                                        <AvatarFallback>
                                          {message.sender
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs font-medium">{message.sender}</span>
                                      <span className="text-xs text-gray-500">{message.time}</span>
                                    </div>
                                  )}
                                  {message.isFile ? (
                                    <div
                                      className={`flex items-center gap-3 rounded-lg p-3 ${
                                        message.isSelf ? "bg-pink-500 text-white" : "bg-white border shadow-sm"
                                      }`}
                                    >
                                      <div
                                        className={`rounded-lg p-2 ${message.isSelf ? "bg-pink-600" : "bg-gray-100"}`}
                                      >
                                        <FileText
                                          className={`h-6 w-6 ${message.isSelf ? "text-white" : "text-gray-500"}`}
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium">{message.content}</p>
                                        <p className={`text-xs ${message.isSelf ? "text-pink-200" : "text-gray-500"}`}>
                                          Click to download
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className={`rounded-lg p-3 ${
                                        message.isSelf ? "bg-pink-500 text-white" : "bg-white border shadow-sm"
                                      }`}
                                    >
                                      <p>{message.content}</p>
                                      {message.isSelf && (
                                        <div className="flex justify-end mt-1">
                                          <span className="text-xs text-pink-200">{message.time}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="border-t p-4">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Type a message..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="min-h-[50px]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Paperclip className="h-5 w-5 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ImageIcon className="h-5 w-5 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Smile className="h-5 w-5 text-gray-500" />
                            </Button>
                            <Button className="bg-pink-500 hover:bg-pink-600" size="icon" onClick={handleSendMessage}>
                              <Send className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-white p-12 text-center shadow-sm">
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
                        className="mb-4 h-12 w-12 text-gray-300"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                      </svg>
                      <h3 className="mb-2 text-xl font-medium">No conversation selected</h3>
                      <p className="mb-6 text-gray-500">Select a conversation from the sidebar to start chatting</p>
                      <Button className="bg-pink-500 hover:bg-pink-600">
                        <Plus className="mr-2 h-4 w-4" /> Start New Conversation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="m-0">
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="font-medium">Shared Resources</h2>
                  <Button className="bg-pink-500 hover:bg-pink-600">
                    <Plus className="mr-2 h-4 w-4" /> Upload Resource
                  </Button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search resources..." className="pl-9" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm font-medium text-gray-500">
                          <th className="pb-3 pl-4 pr-2">Name</th>
                          <th className="px-2 pb-3">Type</th>
                          <th className="px-2 pb-3">Shared By</th>
                          <th className="px-2 pb-3">Date</th>
                          <th className="px-2 pb-3">Size</th>
                          <th className="px-2 pb-3 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {sharedResources.map((resource) => (
                          <tr key={resource.id} className="hover:bg-gray-50">
                            <td className="py-4 pl-4 pr-2">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2">
                                  <FileText className="h-5 w-5 text-gray-500" />
                                </div>
                                <span className="font-medium">{resource.name}</span>
                              </div>
                            </td>
                            <td className="px-2 py-4">
                              <span className="rounded-full bg-pink-100 px-2 py-1 text-xs text-pink-800">
                                {resource.type}
                              </span>
                            </td>
                            <td className="px-2 py-4">{resource.sender}</td>
                            <td className="px-2 py-4">{resource.date}</td>
                            <td className="px-2 py-4">{resource.size}</td>
                            <td className="px-2 py-4 pr-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Download
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notebooks" className="m-0">
              <div className="grid gap-6 md:grid-cols-2">
                {notebooks.map((notebook) => (
                  <Card key={notebook.id} className="overflow-hidden">
                    <div className="h-2 bg-pink-500"></div>
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-medium">{notebook.name}</h3>
                          <p className="text-sm text-gray-500">
                            Last updated: {notebook.lastUpdated} • {notebook.itemCount} items
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Open
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {notebook.collaborator
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">Shared with {notebook.collaborator}</span>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card className="flex h-full flex-col items-center justify-center p-6 text-center border-dashed border-2">
                  <Plus className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-2 text-xl font-medium">Create New Notebook</h3>
                  <p className="mb-6 text-gray-500">
                    Organize your mentorship resources and notes in a collaborative notebook
                  </p>
                  <Button className="bg-pink-500 hover:bg-pink-600">
                    <Plus className="mr-2 h-4 w-4" /> New Notebook
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
