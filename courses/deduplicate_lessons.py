#!/usr/bin/env python3
"""
INR100 Course Content Deduplication Script
Fixes duplicate lessons created during reorganization
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

def get_unique_lesson_content(content1, content2):
    """Determine which content is more comprehensive"""
    # Prefer content with more details, longer content, or more sections
    if len(content1) > len(content2):
        return content1, content2  # Keep content1
    else:
        return content2, content1  # Keep content2

def deduplicate_lessons():
    """Remove duplicate lessons and keep the best version"""
    courses_dir = Path('/workspace/INR100-APP/courses')
    
    # Group lessons by module and lesson number
    lessons_by_module = defaultdict(list)
    
    # Find all lesson files
    for lesson_file in courses_dir.rglob('lesson-*.md'):
        module_path = lesson_file.parent
        lessons_by_module[str(module_path)].append(lesson_file)
    
    duplicates_removed = 0
    
    for module_path, lesson_files in lessons_by_module.items():
        print(f"Processing module: {module_path}")
        
        # Group lessons by lesson number (e.g., lesson-01, lesson-001)
        lesson_groups = defaultdict(list)
        
        for lesson_file in lesson_files:
            # Extract lesson number (handle both lesson-01 and lesson-001)
            filename = lesson_file.name
            if filename.startswith('lesson-'):
                if filename.startswith('lesson-001-') or filename.startswith('lesson-002-'):
                    # Extract full number for 3-digit format
                    lesson_num = filename.split('-')[1]  # e.g., "001"
                else:
                    # Extract number for 2-digit format  
                    lesson_num = filename.split('-')[1]  # e.g., "01"
                lesson_groups[lesson_num].append(lesson_file)
        
        # Handle duplicates within each lesson number group
        for lesson_num, files in lesson_groups.items():
            if len(files) > 1:
                print(f"  Found {len(files)} duplicates for lesson {lesson_num}")
                
                # Read all duplicate files
                file_contents = []
                for file_path in files:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            file_contents.append((file_path, content))
                    except Exception as e:
                        print(f"    Error reading {file_path}: {e}")
                
                # Find the best version (longest content)
                if file_contents:
                    best_file = max(file_contents, key=lambda x: len(x[1]))
                    best_path = best_file[0]
                    best_content = best_file[1]
                    
                    print(f"    Keeping: {best_path.name}")
                    
                    # Remove all other files
                    for file_path, content in file_contents:
                        if file_path != best_path:
                            try:
                                file_path.unlink()
                                duplicates_removed += 1
                                print(f"    Removed: {file_path.name}")
                            except Exception as e:
                                print(f"    Error removing {file_path}: {e}")
    
    print(f"\nDeduplication completed!")
    print(f"Duplicates removed: {duplicates_removed}")
    
    # Final count
    final_count = len(list(courses_dir.rglob('lesson-*.md')))
    print(f"Final lesson count: {final_count}")

if __name__ == "__main__":
    deduplicate_lessons()
