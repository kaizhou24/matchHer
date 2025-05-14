import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface User {
  id: string
  name: string
  role: string
  bio: string
  pronouns: string
  company: string
  avatar: string
  skills: string[]
  matchPercentage: number
  alignmentSummary: string
}

interface MatchProfileProps {
  user: User
}

export function MatchProfile({ user }: MatchProfileProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{user.name}</h3>
            <span className="text-sm text-gray-500">({user.pronouns})</span>
          </div>
          <p className="text-sm text-gray-500">{user.role}</p>
          <p className="text-sm text-gray-500">{user.company}</p>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Match Score</span>
          <span className="font-medium">{user.matchPercentage}%</span>
        </div>
        <Progress value={user.matchPercentage} className="h-2" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Why you match</h4>
        <p className="text-sm text-gray-500">{user.alignmentSummary}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Areas of expertise</h4>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
} 