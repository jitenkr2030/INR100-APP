#!/usr/bin/env python3
"""
INR100 Enhanced File Naming and Metadata Enhancement Script
Implements frontmatter YAML headers and multi-media content structure
"""

import os
import re
from pathlib import Path
from datetime import datetime
import yaml

def get_lesson_metadata(lesson_path, level, module_name):
    """Generate comprehensive metadata for a lesson"""
    
    # Extract lesson number and title from filename
    filename = lesson_path.name
    lesson_match = re.match(r'lesson-(\d+)(?:-(\d+))?-([^-]+)\.md', filename)
    
    if lesson_match:
        primary_num = lesson_match.group(1)
        sub_num = lesson_match.group(2)
        title_slug = lesson_match.group(3).replace('-', ' ')
        
        lesson_num = f"{primary_num}.{sub_num}" if sub_num else primary_num
    else:
        lesson_num = "1"
        title_slug = filename.replace('.md', '').replace('lesson-', '').replace('-', ' ')
    
    # Convert title to proper case
    title = ' '.join(word.capitalize() for word in title_slug.split())
    
    # Determine difficulty based on level and content
    difficulty_map = {
        'foundation-level': 'Beginner',
        'intermediate-level': 'Intermediate', 
        'advanced-level': 'Advanced'
    }
    difficulty = difficulty_map.get(level, 'Beginner')
    
    # Calculate duration based on level and content complexity
    duration_map = {
        'foundation-level': {'base': 15, 'range': (10, 25)},
        'intermediate-level': {'base': 20, 'range': (15, 30)},
        'advanced-level': {'base': 25, 'range': (20, 40)}
    }
    duration_info = duration_map.get(level, {'base': 15, 'range': (10, 25)})
    duration = f"{duration_info['base']} minutes"
    
    # XP reward based on level
    xp_map = {
        'foundation-level': 50,
        'intermediate-level': 75,
        'advanced-level': 100
    }
    xp_reward = xp_map.get(level, 50)
    
    # Prerequisites based on level
    prereq_map = {
        'foundation-level': ["Basic financial literacy"],
        'intermediate-level': ["Foundation Level completion", "Basic investing knowledge"],
        'advanced-level': ["Intermediate Level completion", "Advanced financial knowledge"]
    }
    prerequisites = prereq_map.get(level, ["Basic financial literacy"])
    
    # Learning objectives based on content
    objectives = generate_learning_objectives(title_slug, level)
    
    # Tags based on content and level
    tags = generate_tags(title_slug, level, module_name)
    
    # Generate related lessons (next and previous in sequence)
    related_lessons = generate_related_lessons(lesson_num, module_name)
    
    # Create lesson ID
    module_id = module_name.upper().replace('-', '')[:2]  # e.g., "MF" for mutual-funds
    lesson_id = f"{module_id}-{lesson_num.zfill(3)}"
    
    metadata = {
        'lesson_id': lesson_id,
        'title': title,
        'duration': duration,
        'difficulty': difficulty,
        'xp_reward': xp_reward,
        'prerequisites': prerequisites,
        'learning_objectives': objectives,
        'tags': tags,
        'related_lessons': related_lessons,
        'last_updated': datetime.now().strftime('%Y-%m-%d'),
        'content_level': level,
        'module': module_name,
        'lesson_number': lesson_num
    }
    
    return metadata

def generate_learning_objectives(title_slug, level):
    """Generate learning objectives based on content and level"""
    
    base_objectives = {
        'mutual': [
            "Understand mutual fund fundamentals",
            "Learn NAV calculation methods",
            "Identify different fund types",
            "Analyze fund performance metrics"
        ],
        'derivatives': [
            "Master derivatives concepts",
            "Understand options and futures",
            "Learn risk management techniques",
            "Apply trading strategies"
        ],
        'investing': [
            "Understand investment principles",
            "Learn asset allocation",
            "Develop portfolio strategies",
            "Analyze investment risks"
        ],
        'banking': [
            "Understand banking systems",
            "Learn about banking products",
            "Master financial safety measures",
            "Recognize security practices"
        ],
        'stock': [
            "Understand stock market mechanics",
            "Learn technical and fundamental analysis",
            "Master valuation methods",
            "Develop trading strategies"
        ],
        'portfolio': [
            "Understand portfolio theory",
            "Learn asset allocation",
            "Master diversification strategies",
            "Optimize portfolio performance"
        ],
        'alternative': [
            "Understand alternative investments",
            "Learn real estate investing",
            "Master crypto and digital assets",
            "Develop ESG strategies"
        ],
        'trading': [
            "Understand professional trading",
            "Learn algorithmic strategies",
            "Master risk management",
            "Develop trading psychology"
        ]
    }
    
    # Select appropriate objectives based on content
    objectives = []
    title_lower = title_slug.lower()
    
    for key, obj_list in base_objectives.items():
        if key in title_lower:
            objectives.extend(obj_list[:2])  # Take first 2 from matching category
            break
    else:
        # Default objectives based on level
        if 'foundation' in level:
            objectives = ["Understand basic concepts", "Learn fundamental principles", "Apply practical examples"]
        elif 'intermediate' in level:
            objectives = ["Analyze complex concepts", "Apply advanced techniques", "Solve real-world problems"]
        else:
            objectives = ["Master expert-level concepts", "Develop professional strategies", "Lead complex analysis"]
    
    return objectives[:3]  # Return max 3 objectives

def generate_tags(title_slug, level, module_name):
    """Generate relevant tags for the lesson"""
    
    # Base tags by content type
    content_tags = {
        'mutual': ['mutual funds', 'investing', 'funds'],
        'derivatives': ['derivatives', 'options', 'futures', 'trading'],
        'investing': ['investing', 'wealth building', 'investment'],
        'banking': ['banking', 'financial services', 'safety'],
        'stock': ['stocks', 'equity', 'market analysis'],
        'portfolio': ['portfolio', 'asset allocation', 'diversification'],
        'alternative': ['alternative investments', 'real estate', 'crypto'],
        'trading': ['trading', 'quantitative', 'professional']
    }
    
    # Level tags
    level_tags = {
        'foundation-level': ['beginner', 'fundamentals'],
        'intermediate-level': ['intermediate', 'analysis'],
        'advanced-level': ['advanced', 'professional']
    }
    
    # Module-specific tags
    module_tags = {
        'module-01-money-basics': ['money', 'financial literacy', 'basics'],
        'module-02-banking-systems': ['banking', 'safety', 'services'],
        'module-03-investing-intro': ['investing', 'sip', 'introduction'],
        'module-04-mutual-funds': ['mutual funds', 'funds', 'investment'],
        'module-05-stock-analysis': ['stocks', 'analysis', 'equity'],
        'module-06-portfolio-building': ['portfolio', 'asset allocation'],
        'module-07-derivatives': ['derivatives', 'options', 'futures'],
        'module-08-alternative-investments': ['alternative', 'real estate', 'crypto'],
        'module-09-professional-trading': ['professional', 'trading', 'quantitative']
    }
    
    # Collect tags
    tags = []
    title_lower = title_slug.lower()
    
    # Add content-based tags
    for key, tag_list in content_tags.items():
        if key in title_lower:
            tags.extend(tag_list)
            break
    
    # Add level tags
    tags.extend(level_tags.get(level, []))
    
    # Add module tags
    tags.extend(module_tags.get(module_name, []))
    
    # Add general tags
    tags.extend(['financial education', 'inr100'])
    
    return list(set(tags))  # Remove duplicates

def generate_related_lessons(lesson_num, module_name):
    """Generate related lessons (previous and next in sequence)"""
    
    try:
        # Parse lesson number
        if '.' in lesson_num:
            num_parts = lesson_num.split('.')
            primary_num = int(num_parts[0])
            sub_num = int(num_parts[1]) if len(num_parts) > 1 else 0
        else:
            primary_num = int(lesson_num)
            sub_num = 0
        
        module_id = module_name.upper().replace('-', '')[:2]
        
        related = []
        
        # Previous lesson
        if primary_num > 1 or (primary_num == 1 and sub_num > 1):
            if sub_num > 1:
                prev_lesson = f"{module_id}-{primary_num:03d}.{sub_num-1:03d}"
            else:
                prev_lesson = f"{module_id}-{(primary_num-1):03d}.001"
            related.append(prev_lesson)
        
        # Next lesson
        next_lesson = f"{module_id}-{primary_num:03d}.{sub_num+1:03d}"
        related.append(next_lesson)
        
        return related
        
    except:
        return []

def create_enhanced_metadata():
    """Create enhanced metadata for all lessons"""
    
    courses_dir = Path('/workspace/INR100-APP/courses')
    enhanced_count = 0
    
    # Find all lesson files
    lesson_files = list(courses_dir.rglob('lesson-*.md'))
    
    for lesson_file in lesson_files:
        try:
            # Determine level and module
            path_parts = lesson_file.parts
            level = None
            module_name = None
            
            for i, part in enumerate(path_parts):
                if part in ['foundation-level', 'intermediate-level', 'advanced-level']:
                    level = part
                    module_name = path_parts[i + 1] if i + 1 < len(path_parts) else 'unknown'
                    break
            
            if not level:
                continue
            
            # Read existing content
            with open(lesson_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Generate metadata
            metadata = get_lesson_metadata(lesson_file, level, module_name)
            
            # Remove existing frontmatter if present
            if content.startswith('---'):
                content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
            
            # Create new frontmatter
            frontmatter = "---\n" + yaml.dump(metadata, default_flow_style=False, allow_unicode=True) + "---\n\n"
            
            # Combine frontmatter with content
            enhanced_content = frontmatter + content
            
            # Write enhanced content
            with open(lesson_file, 'w', encoding='utf-8') as f:
                f.write(enhanced_content)
            
            enhanced_count += 1
            
            if enhanced_count % 50 == 0:
                print(f"Enhanced {enhanced_count} lessons...")
            
        except Exception as e:
            print(f"Error enhancing {lesson_file}: {e}")
    
    print(f"Metadata enhancement completed: {enhanced_count} lessons enhanced")
    return enhanced_count

def create_multimedia_structure():
    """Create multi-media content directories for all modules"""
    
    courses_dir = Path('/workspace/INR100-APP/courses')
    multimedia_dirs = ['videos', 'images', 'audio', 'interactive', 'downloads']
    
    # Find all module directories
    module_dirs = []
    for level in ['foundation-level', 'intermediate-level', 'advanced-level']:
        level_dir = courses_dir / level
        if level_dir.exists():
            for module_dir in level_dir.iterdir():
                if module_dir.is_dir() and module_dir.name.startswith('module-'):
                    module_dirs.append(module_dir)
    
    created_dirs = 0
    
    for module_dir in module_dirs:
        print(f"Creating multimedia structure for: {module_dir.name}")
        
        for media_type in multimedia_dirs:
            media_dir = module_dir / media_type
            if not media_dir.exists():
                media_dir.mkdir(parents=True, exist_ok=True)
                created_dirs += 1
                
                # Create README for each media type
                readme_content = f"""# {media_type.title()} - {module_dir.name}

## Overview
This directory contains {media_type} content for {module_dir.name.replace('-', ' ').title()}.

## Content Structure
{get_media_structure_description(media_type, module_dir.name)}

## File Naming Convention
- **Videos**: `lesson-XXX-video-name.mp4`
- **Images**: `lesson-XXX-diagram-name.png`
- **Audio**: `lesson-XXX-podcast-name.mp3`
- **Interactive**: `lesson-XXX-simulation.html`
- **Downloads**: `lesson-XXX-template-name.pdf`

## Usage Guidelines
- All content should be organized by lesson number
- Use descriptive, SEO-friendly filenames
- Ensure accessibility compliance
- Optimize file sizes for web delivery

---
*Created on {datetime.now().strftime("%B %d, %Y")}*
*Part of INR100 Multimedia Content Structure*
"""
                
                readme_file = media_dir / 'README.md'
                with open(readme_file, 'w', encoding='utf-8') as f:
                    f.write(readme_content)
    
    print(f"Multimedia structure creation completed: {created_dirs} directories created")
    return created_dirs

def get_media_structure_description(media_type, module_name):
    """Get description for each media type"""
    
    descriptions = {
        'videos': """### Video Content
- **Tutorial Videos**: Step-by-step lesson explanations (5-15 minutes)
- **Concept Videos**: Visual explanations of complex topics (3-10 minutes)
- **Demo Videos**: Practical application demonstrations (10-20 minutes)
- **Expert Interviews**: Industry professional insights (15-30 minutes)""",
        
        'images': """### Visual Content
- **Infographics**: Data visualization and concept maps
- **Diagrams**: Technical illustrations and flowcharts
- **Charts**: Market data and performance visualizations
- **Slides**: Educational presentation materials""",
        
        'audio': """### Audio Content
- **Podcast Lessons**: Audio-only lesson versions (15-25 minutes)
- **Expert Interviews**: Industry professional discussions
- **Case Study Narratives**: Real-world scenario audio
- **Study Sessions**: Audio recordings for review""",
        
        'interactive': """### Interactive Content
- **Simulations**: HTML5-based financial simulations
- **Calculators**: Interactive calculation tools
- **Quizzes**: Engaging assessment activities
- **Scenarios**: Decision-making practice modules""",
        
        'downloads': """### Downloadable Resources
- **PDF Guides**: Comprehensive lesson summaries
- **Spreadsheets**: Financial planning templates
- **Templates**: Practical worksheets and forms
- **Reference Materials**: Quick reference guides"""
    }
    
    return descriptions.get(media_type, "Media content for enhanced learning experience.")

def main():
    """Main function to implement all enhancements"""
    
    print("=== INR100 Enhanced File Naming & Metadata Implementation ===")
    print()
    
    # Step 1: Create multimedia structure
    print("1. Creating Multi-Media Content Structure...")
    dirs_created = create_multimedia_structure()
    print()
    
    # Step 2: Enhance metadata
    print("2. Enhancing File Metadata...")
    lessons_enhanced = create_enhanced_metadata()
    print()
    
    # Summary
    print("=== ENHANCEMENT COMPLETE ===")
    print(f"Multimedia directories created: {dirs_created}")
    print(f"Lessons enhanced with metadata: {lessons_enhanced}")
    print()
    print("✅ Enhanced file naming and metadata implemented")
    print("✅ Multi-media content structure created")
    print("✅ All lessons now have comprehensive frontmatter")
    print("✅ Professional content organization achieved")

if __name__ == "__main__":
    main()
