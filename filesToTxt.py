#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import fnmatch
import re
import argparse
from pathlib import Path

def parse_gitignore(gitignore_path):
    """Parsuje plik .gitignore i zwraca listę wzorców."""
    if not os.path.exists(gitignore_path):
        return []
    
    patterns = []
    with open(gitignore_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            line = line.strip()
            # Pomijamy puste linie i komentarze
            if not line or line.startswith('#'):
                continue
            # Usuwamy ew. ukośnik na końcu
            if line.endswith('/'):
                line = line[:-1]
            patterns.append(line)
    return patterns

def should_ignore(file_path, ignore_patterns):
    """Sprawdza, czy plik powinien być zignorowany na podstawie wzorców z .gitignore."""
    file_path_str = str(file_path)
    
    # Konwertujemy wzorce gitignore na wzorce fnmatch
    for pattern in ignore_patterns:
        # Obsługa wzorców z gwiazdką
        if '*' in pattern:
            pattern = pattern.replace('.', '\\.')
            pattern = pattern.replace('*', '.*')
            if re.search(pattern, file_path_str):
                return True
        # Wzorce bez gwiazdek
        elif pattern in file_path_str:
            return True
    
    # Ignoruj binarne pliki i katalogi systemowe
    binary_extensions = ['.pyc', '.pyo', '.so', '.o', '.a', '.lib', '.dll', '.exe', '.bin', 
                         '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.db', 
                         '.sqlite', '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z']
    system_dirs = ['.git', '.svn', '.hg', '__pycache__', 'node_modules', 'venv', 'env', '.venv']
    
    # Sprawdź, czy plik ma rozszerzenie binarne
    if any(file_path_str.endswith(ext) for ext in binary_extensions):
        return True
    
    # Sprawdź, czy ścieżka zawiera katalog systemowy
    if any(f'/{dir_}/' in file_path_str or file_path_str.startswith(f'{dir_}/') for dir_ in system_dirs):
        return True
    
    return False

def save_file_contents(project_dir, output_file, ignore_patterns):
    """Zapisuje zawartość wszystkich istotnych plików projektu do pliku tekstowego."""
    project_path = Path(project_dir)
    
    with open(output_file, 'w', encoding='utf-8', errors='replace') as out_f:
        for root, dirs, files in os.walk(project_path):
            # Filtrujemy katalogi, które należy zignorować
            dirs[:] = [d for d in dirs if not should_ignore(Path(root) / d, ignore_patterns)]
            
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(project_path)
                
                # Sprawdź, czy plik powinien być zignorowany
                if should_ignore(rel_path, ignore_patterns):
                    continue
                
                # Zapisz zawartość pliku
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                    
                    # Dodaj separatory i informacje o pliku
                    out_f.write(f"\n{'=' * 80}\n")
                    out_f.write(f"PLIK: {rel_path}\n")
                    out_f.write(f"{'=' * 80}\n\n")
                    out_f.write(content)
                    out_f.write("\n\n")
                except Exception as e:
                    out_f.write(f"\n{'=' * 80}\n")
                    out_f.write(f"PLIK: {rel_path}\n")
                    out_f.write(f"{'=' * 80}\n\n")
                    out_f.write(f"Nie można odczytać pliku: {str(e)}\n\n")

def main():
    parser = argparse.ArgumentParser(description='Zapisuje zawartość plików projektu do pliku tekstowego z uwzględnieniem reguł z .gitignore')
    parser.add_argument('-d', '--directory', default='.', help='Katalog projektu (domyślnie: bieżący katalog)')
    parser.add_argument('-o', '--output', default='project_files.txt', help='Nazwa pliku wyjściowego (domyślnie: project_files.txt)')
    args = parser.parse_args()
    
    project_dir = args.directory
    output_file = args.output
    
    # Znajdź plik .gitignore w katalogu projektu
    gitignore_path = os.path.join(project_dir, '.gitignore')
    ignore_patterns = parse_gitignore(gitignore_path)
    
    print(f"Rozpoczynam skanowanie katalogu: {project_dir}")
    print(f"Znaleziono {len(ignore_patterns)} wzorców do ignorowania")
    
    # Zapisz zawartość plików
    save_file_contents(project_dir, output_file, ignore_patterns)
    
    print(f"Zapisano zawartość plików do: {output_file}")

if __name__ == "__main__":
    main()