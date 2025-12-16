export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  modules: Module[]
}

export interface Module {
  id: string
  categoryId: string
  name: string
  description: string
  order: number
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  content: string
  order: number
  duration: number
  type: 'text' | 'video' | 'quiz' | 'interactive'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  prerequisites?: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  rating: number
  enrolledCount: number
  instructor: string
  modules: Module[]
}