import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; module: string; lessonId: string } }
) {
  try {
    const { category, module, lessonId } = params;
    
    // Construct the path to the lesson file
    const modulePath = moduleData?.path || module;
    const lessonPath = path.join(process.cwd(), 'courses', modulePath, `${lessonId}.md`);
    
    // Check if file exists
    if (!fs.existsSync(lessonPath)) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Read the lesson file
    const lessonContent = fs.readFileSync(lessonPath, 'utf-8');
    
    // Parse the markdown content
    const parsedLesson = parseMarkdownContent(lessonContent, lessonId);
    
    // Get lesson metadata from the course service
    const CourseContentService = await import('@/lib/courseContentService');
    const courseService = CourseContentService.default.getInstance();
    
    // Get module with actual lesson data
    const moduleData = courseService.getModuleWithLessons(category, module);
    let lessonMetadata = null;
    
    if (moduleData && moduleData.lessonsDetail) {
      lessonMetadata = moduleData.lessonsDetail.find((l: any) => l.id === lessonId);
    }

    // Mock progress data - in real app, this would come from database
    const progressData = {
      completed: false,
      timeSpent: 0,
      lastAccessed: new Date().toISOString()
    };

    const lesson = {
      id: lessonId,
      title: lessonMetadata?.title || `Lesson ${lessonId.replace('lesson-', '')}`,
      description: lessonMetadata?.description || 'Lesson content',
      content: {
        type: 'markdown',
        html: convertMarkdownToHtml(lessonContent)
      },
      estimatedDuration: lessonMetadata?.estimatedDuration || 5,
      xpReward: lessonMetadata?.xpReward || 50,
      objectives: lessonMetadata?.objectives || [],
      resources: lessonMetadata?.resources || [],
      ...progressData
    };

    return NextResponse.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error loading lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { category: string; module: string; lessonId: string } }
) {
  try {
    const { category, module, lessonId } = params;
    const body = await request.json();
    
    // In a real app, this would update the database
    // For now, we'll just return success
    
    const { completed, timeSpent } = body;
    
    // Mock update progress
    const progressUpdate = {
      lessonId,
      categoryId: category,
      moduleId: module,
      completed: completed || false,
      timeSpent: timeSpent || 0,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: progressUpdate
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to parse markdown content
function parseMarkdownContent(content: string, lessonId: string) {
  const lines = content.split('\n');
  let title = '';
  let description = '';
  let objectives: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '');
    } else if (line.startsWith('## ')) {
      const objective = line.replace('## ', '').trim();
      if (objective) {
        objectives.push(objective);
      }
    } else if (!description && line.trim() && !line.startsWith('#')) {
      description = line.trim();
    }
  }
  
  return {
    title: title || `Lesson ${lessonId.replace('lesson-', '')}`,
    description: description || 'Lesson content',
    objectives
  };
}

// Helper function to convert markdown to HTML (simplified)
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
  
  // Convert line breaks
  html = html.replace(/\n/gim, '<br>');
  
  return html;
}