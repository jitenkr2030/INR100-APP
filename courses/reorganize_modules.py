#!/usr/bin/env python3
"""
INR100 Course Module Reorganization Script
Reorganizes existing modules into the new structured directory layout
"""

import os
import shutil
import re
from pathlib import Path

def get_module_difficulty(readme_path):
    """Determine module difficulty level from README content"""
    try:
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read().lower()
            
        # Check for explicit level indicators
        if 'foundation level' in content or 'module 1 of' in content or 'beginner' in content:
            return 'foundation'
        elif 'intermediate level' in content or 'module 5 of' in content or 'intermediate' in content:
            return 'intermediate'
        elif 'advanced level' in content or 'module 12 of' in content or 'advanced' in content:
            return 'advanced'
        else:
            # Fallback to module number analysis
            if any(f'module-{i:02d}' in readme_path.lower() or f'module {i}' in content for i in range(1, 4)):
                return 'foundation'
            elif any(f'module-{i:02d}' in readme_path.lower() or f'module {i}' in content for i in range(4, 9)):
                return 'intermediate'
            else:
                return 'advanced'
    except:
        return 'unknown'

def get_module_category(readme_path):
    """Determine module category from content"""
    try:
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read().lower()
            
        # Foundation level categories
        if 'money' in content and 'basics' in content:
            return 'foundation', 'module-01-money-basics'
        elif 'personal finance' in content or 'banking' in content:
            return 'foundation', 'module-02-banking-systems'
        elif 'sip' in content or 'wealth building' in content:
            return 'foundation', 'module-03-investing-intro'
            
        # Intermediate level categories
        elif 'mutual fund' in content and 'advanced' not in content:
            return 'intermediate', 'module-04-mutual-funds'
        elif 'stock market' in content and 'analysis' in content:
            return 'intermediate', 'module-05-stock-analysis'
        elif 'portfolio' in content and 'management' in content:
            return 'intermediate', 'module-06-portfolio-building'
            
        # Advanced level categories
        elif 'derivatives' in content:
            return 'advanced', 'module-07-derivatives'
        elif 'alternative' in content or 'esg' in content or 'sustainable' in content:
            return 'advanced', 'module-08-alternative-investments'
        elif 'professional' in content or 'business' in content or 'entrepreneurship' in content:
            return 'advanced', 'module-09-professional-trading'
            
        # Specialization tracks
        elif 'retirement' in content:
            return 'specialization', 'retirement-planning'
        elif 'tax' in content:
            return 'specialization', 'tax-optimization'
        elif 'real estate' in content:
            return 'specialization', 'real-estate-investing'
        elif 'business' in content or 'entrepreneurship' in content:
            return 'specialization', 'business-finance'
            
        # Fallback categorization
        else:
            return 'foundation', 'module-01-money-basics'
    except:
        return 'foundation', 'module-01-money-basics'

def reorganize_modules():
    """Main reorganization function"""
    courses_dir = Path('/workspace/INR100-APP/courses')
    
    # Find all module directories
    module_dirs = []
    for item in courses_dir.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            readme_file = item / 'README.md'
            if readme_file.exists():
                module_dirs.append(item)
    
    print(f"Found {len(module_dirs)} module directories to reorganize")
    
    # Process each module
    for module_dir in module_dirs:
        readme_path = module_dir / 'README.md'
        if not readme_path.exists():
            continue
            
        # Determine module characteristics
        difficulty = get_module_difficulty(readme_path)
        category, target_name = get_module_category(readme_path)
        
        print(f"Processing: {module_dir.name}")
        print(f"  - Difficulty: {difficulty}")
        print(f"  - Category: {category}")
        print(f"  - Target: {target_name}")
        
        # Determine target directory
        if category == 'foundation':
            target_dir = courses_dir / 'foundation-level' / target_name
        elif category == 'intermediate':
            target_dir = courses_dir / 'intermediate-level' / target_name
        elif category == 'advanced':
            target_dir = courses_dir / 'advanced-level' / target_name
        elif category == 'specialization':
            target_dir = courses_dir / 'specialization-tracks' / target_name
        else:
            target_dir = courses_dir / 'foundation-level' / target_name
        
        # Create target directory if it doesn't exist
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy module contents to target directory
        try:
            for file_path in module_dir.iterdir():
                if file_path.name != 'reorganize_modules.py':  # Don't copy this script
                    target_file = target_dir / file_path.name
                    if file_path.is_dir():
                        shutil.copytree(file_path, target_file, dirs_exist_ok=True)
                    else:
                        shutil.copy2(file_path, target_file)
            print(f"  - Successfully moved to: {target_dir}")
        except Exception as e:
            print(f"  - Error moving module: {e}")
        
        print()
    
    print("Module reorganization completed!")

if __name__ == "__main__":
    reorganize_modules()
