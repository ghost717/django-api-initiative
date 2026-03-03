#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Project Files Aggregator
Agreguje zawartość plików projektu do jednego pliku tekstowego
z uwzględnieniem reguł .gitignore i inteligentnym filtrowaniem.
"""

import os
import argparse
from pathlib import Path
from typing import List, Set, Tuple

# Opcjonalnie: użyj pathspec jeśli dostępne, w przeciwnym razie fallback
try:
    import pathspec
    HAS_PATHSPEC = True
except ImportError:
    HAS_PATHSPEC = False
    import fnmatch

# ========================
# KONFIGURACJA
# ========================

# Rozszerzenia binarne/niechciane (bez plików tekstowych!)
BINARY_EXTENSIONS = {
    # Python
    '.pyc', '.pyo', '.pyd',
    # Skompilowane
    '.so', '.o', '.a', '.lib', '.dll', '.exe', '.bin', '.dylib',
    # Obrazy
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico', '.webp',
    # Bazy danych
    '.db', '.sqlite', '.sqlite3',
    # Dokumenty
    '.pdf', '.doc', '.docx',
    # Archiwa
    '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz',
    # Backup i tymczasowe
    '.bak', '.tmp', '.swp', '.swo',
    # Multimedia
    '.mp3', '.mp4', '.avi', '.mov', '.wav',
}

# Katalogi do pominięcia
IGNORE_DIRS = {
    '.git', '.svn', '.hg',                    # VCS
    '__pycache__', '.pytest_cache',           # Python
    'node_modules', '.npm',                   # Node.js
    'venv', 'env', '.venv', '.env',          # Virtual environments
    '.vscode', '.idea', '.vs',                # IDE
    'dist', 'build', 'target',                # Build
    '.next', '.nuxt',                         # Frameworks
    'coverage', '.coverage',                  # Testing
}

# Pliki do pominięcia (pełne nazwy)
IGNORE_FILES = {
    '.DS_Store',           # macOS
    'Thumbs.db',          # Windows
    '.env',               # Secrets
    '.env.local',
    'package-lock.json',  # Duże pliki lockowe
    'yarn.lock',
    'poetry.lock',
    '.gitattributes',
    '.gitignore',
    '.github',
    'README.md',
    'app-without-gpu.py',
}

# Maksymalny rozmiar pliku (w MB)
MAX_FILE_SIZE_MB = 10


# ========================
# FUNKCJE
# ========================

def parse_gitignore(gitignore_path: Path) -> List[str]:
    """
    Parsuje plik .gitignore i zwraca listę wzorców.
    
    Args:
        gitignore_path: Ścieżka do pliku .gitignore
        
    Returns:
        Lista wzorców do ignorowania
    """
    if not gitignore_path.exists():
        return []
    
    patterns = []
    try:
        with open(gitignore_path, 'r', encoding='utf-8', errors='replace') as f:
            for line in f:
                line = line.strip()
                # Pomijamy puste linie i komentarze
                if not line or line.startswith('#'):
                    continue
                patterns.append(line)
    except Exception as e:
        print(f"⚠️  Ostrzeżenie: Nie można odczytać .gitignore: {e}")
        return []
    
    return patterns


def create_gitignore_spec(patterns: List[str]):
    """
    Tworzy specyfikację gitignore używając pathspec lub fallback.
    
    Args:
        patterns: Lista wzorców z .gitignore
        
    Returns:
        Obiekt spec do sprawdzania ścieżek
    """
    if HAS_PATHSPEC:
        return pathspec.PathSpec.from_lines('gitwildmatch', patterns)
    else:
        # Fallback: prosty matcher
        return patterns


def should_ignore_by_gitignore(rel_path: Path, gitignore_spec) -> bool:
    """
    Sprawdza, czy ścieżka pasuje do wzorców .gitignore.
    
    Args:
        rel_path: Względna ścieżka do pliku
        gitignore_spec: Specyfikacja wzorców
        
    Returns:
        True jeśli plik powinien być zignorowany
    """
    if not gitignore_spec:
        return False
    
    path_str = str(rel_path)
    
    if HAS_PATHSPEC:
        return gitignore_spec.match_file(path_str)
    else:
        # Fallback: prosty matcher
        for pattern in gitignore_spec:
            # Usuwamy końcowy slash
            pattern = pattern.rstrip('/')
            
            # Wzorce z gwiazdkami
            if '*' in pattern or '?' in pattern:
                if fnmatch.fnmatch(path_str, pattern):
                    return True
                # Sprawdź też wszystkie komponenty ścieżki
                if fnmatch.fnmatch(rel_path.name, pattern):
                    return True
            # Dokładne dopasowanie
            elif pattern in path_str:
                return True
    
    return False


def should_ignore(
    rel_path: Path,
    gitignore_spec,
    custom_extensions: Set[str] = None,
    custom_dirs: Set[str] = None,
    custom_files: Set[str] = None
) -> Tuple[bool, str]:
    """
    Sprawdza, czy plik powinien być zignorowany.
    
    Args:
        rel_path: Względna ścieżka do pliku
        gitignore_spec: Specyfikacja wzorców .gitignore
        custom_extensions: Dodatkowe rozszerzenia do ignorowania
        custom_dirs: Dodatkowe katalogi do ignorowania
        custom_files: Dodatkowe pliki do ignorowania
        
    Returns:
        (should_ignore, reason): Tuple z decyzją i powodem
    """
    extensions = BINARY_EXTENSIONS | (custom_extensions or set())
    dirs = IGNORE_DIRS | (custom_dirs or set())
    files = IGNORE_FILES | (custom_files or set())
    
    # Sprawdź .gitignore
    if should_ignore_by_gitignore(rel_path, gitignore_spec):
        return True, ".gitignore"
    
    # Sprawdź nazwę pliku
    if rel_path.name in files:
        return True, f"ignorowana nazwa pliku ({rel_path.name})"
    
    # Sprawdź rozszerzenie
    if rel_path.suffix.lower() in extensions:
        return True, f"binarne rozszerzenie ({rel_path.suffix})"
    
    # Sprawdź katalogi w ścieżce
    for part in rel_path.parts:
        if part in dirs:
            return True, f"ignorowany katalog ({part})"
    
    return False, ""


def get_file_size_mb(file_path: Path) -> float:
    """Zwraca rozmiar pliku w MB."""
    return file_path.stat().st_size / (1024 * 1024)


def save_file_contents(
    project_dir: Path,
    output_file: Path,
    gitignore_spec,
    verbose: bool = False,
    max_size_mb: float = MAX_FILE_SIZE_MB,
    custom_extensions: Set[str] = None,
    custom_dirs: Set[str] = None,
    custom_files: Set[str] = None
) -> Tuple[int, int, int]:
    """
    Zapisuje zawartość plików do pliku wyjściowego.
    
    Args:
        project_dir: Katalog projektu
        output_file: Plik wyjściowy
        gitignore_spec: Specyfikacja .gitignore
        verbose: Czy wyświetlać szczegóły
        max_size_mb: Maksymalny rozmiar pliku w MB
        custom_extensions: Dodatkowe rozszerzenia do ignorowania
        custom_dirs: Dodatkowe katalogi do ignorowania
        custom_files: Dodatkowe pliki do ignorowania
        
    Returns:
        (files_processed, files_ignored, files_too_large): Statystyki
    """
    files_processed = 0
    files_ignored = 0
    files_too_large = 0
    
    with open(output_file, 'w', encoding='utf-8', errors='replace') as out_f:
        # Nagłówek
        out_f.write(f"{'=' * 80}\n")
        out_f.write(f"AGREGACJA PLIKÓW PROJEKTU\n")
        out_f.write(f"Katalog: {project_dir.absolute()}\n")
        out_f.write(f"{'=' * 80}\n\n")
        
        for root, dirs, files in os.walk(project_dir):
            root_path = Path(root)
            
            # Filtruj katalogi (modyfikacja in-place)
            original_dirs = dirs.copy()
            dirs[:] = []
            for d in original_dirs:
                dir_path = root_path / d
                rel_dir_path = dir_path.relative_to(project_dir)
                
                ignore, reason = should_ignore(
                    rel_dir_path, 
                    gitignore_spec,
                    custom_extensions,
                    custom_dirs,
                    custom_files
                )
                
                if not ignore:
                    dirs.append(d)
                elif verbose:
                    print(f"⏭️  Pomijam katalog: {rel_dir_path} ({reason})")
            
            # Przetwarzaj pliki
            for file in sorted(files):
                file_path = root_path / file
                
                # Pomiń plik wyjściowy
                if file_path.absolute() == output_file.absolute():
                    continue
                
                rel_path = file_path.relative_to(project_dir)
                
                # Sprawdź, czy ignorować
                ignore, reason = should_ignore(
                    rel_path, 
                    gitignore_spec,
                    custom_extensions,
                    custom_dirs,
                    custom_files
                )
                
                if ignore:
                    files_ignored += 1
                    if verbose:
                        print(f"⏭️  Pomijam: {rel_path} ({reason})")
                    continue
                
                # Sprawdź rozmiar
                try:
                    size_mb = get_file_size_mb(file_path)
                    if size_mb > max_size_mb:
                        files_too_large += 1
                        if verbose:
                            print(f"⚠️  Za duży plik ({size_mb:.2f}MB): {rel_path}")
                        
                        out_f.write(f"\n{'=' * 80}\n")
                        out_f.write(f"PLIK: {rel_path}\n")
                        out_f.write(f"{'=' * 80}\n\n")
                        out_f.write(f"[Plik pominięty - rozmiar: {size_mb:.2f}MB przekracza limit {max_size_mb}MB]\n\n")
                        continue
                except Exception as e:
                    if verbose:
                        print(f"⚠️  Błąd sprawdzania rozmiaru {rel_path}: {e}")
                
                # Zapisz zawartość pliku
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                    
                    out_f.write(f"\n{'=' * 80}\n")
                    out_f.write(f"PLIK: {rel_path}\n")
                    out_f.write(f"Rozmiar: {size_mb:.2f}MB\n")
                    out_f.write(f"{'=' * 80}\n\n")
                    out_f.write(content)
                    out_f.write("\n\n")
                    
                    files_processed += 1
                    if verbose:
                        print(f"✅ Przetworzono: {rel_path}")
                    
                except Exception as e:
                    out_f.write(f"\n{'=' * 80}\n")
                    out_f.write(f"PLIK: {rel_path}\n")
                    out_f.write(f"{'=' * 80}\n\n")
                    out_f.write(f"[Błąd odczytu: {str(e)}]\n\n")
                    
                    if verbose:
                        print(f"❌ Błąd: {rel_path} - {e}")
    
    return files_processed, files_ignored, files_too_large


def main():
    """Główna funkcja programu."""
    parser = argparse.ArgumentParser(
        description='Agreguje zawartość plików projektu do jednego pliku tekstowego',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Przykłady użycia:
  %(prog)s                                          # Bieżący katalog
  %(prog)s -d /path/to/project                      # Konkretny katalog
  %(prog)s -o output.txt -v                         # Z verbose mode
  %(prog)s --max-size 5                             # Max 5MB na plik
  %(prog)s --ignore-ext .log --ignore-ext .cache    # Dodatkowe rozszerzenia
        """
    )
    
    parser.add_argument(
        '-d', '--directory',
        default='.',
        help='Katalog projektu (domyślnie: bieżący)'
    )
    parser.add_argument(
        '-o', '--output',
        default='project_files.txt',
        help='Plik wyjściowy (domyślnie: project_files.txt)'
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Wyświetlaj szczegółowe informacje'
    )
    parser.add_argument(
        '--max-size',
        type=float,
        default=MAX_FILE_SIZE_MB,
        help=f'Maksymalny rozmiar pliku w MB (domyślnie: {MAX_FILE_SIZE_MB})'
    )
    parser.add_argument(
        '--ignore-ext',
        action='append',
        help='Dodatkowe rozszerzenia do ignorowania (np. --ignore-ext .log)'
    )
    parser.add_argument(
        '--ignore-dir',
        action='append',
        help='Dodatkowe katalogi do ignorowania (np. --ignore-dir temp)'
    )
    parser.add_argument(
        '--ignore-file',
        action='append',
        help='Dodatkowe pliki do ignorowania (np. --ignore-file config.local.json)'
    )
    parser.add_argument(
        '--no-gitignore',
        action='store_true',
        help='Ignoruj plik .gitignore'
    )
    
    args = parser.parse_args()
    
    # Walidacja
    project_dir = Path(args.directory).resolve()
    if not project_dir.exists():
        print(f"❌ Błąd: Katalog '{project_dir}' nie istnieje!")
        return 1
    
    if not project_dir.is_dir():
        print(f"❌ Błąd: '{project_dir}' nie jest katalogiem!")
        return 1
    
    output_file = Path(args.output).resolve()
    
    # Przygotuj custom listy
    custom_extensions = set(args.ignore_ext or [])
    custom_dirs = set(args.ignore_dir or [])
    custom_files = set(args.ignore_file or [])
    
    # Wyświetl info
    print(f"📂 Katalog projektu: {project_dir}")
    print(f"📄 Plik wyjściowy: {output_file}")
    print(f"💾 Maksymalny rozmiar pliku: {args.max_size}MB")
    
    if not HAS_PATHSPEC:
        print("⚠️  Ostrzeżenie: Biblioteka 'pathspec' niedostępna - używam uproszczonego parsera .gitignore")
        print("   Zainstaluj: pip install pathspec")
    
    # Parsuj .gitignore
    gitignore_spec = None
    if not args.no_gitignore:
        gitignore_path = project_dir / '.gitignore'
        patterns = parse_gitignore(gitignore_path)
        if patterns:
            gitignore_spec = create_gitignore_spec(patterns)
            print(f"📋 Załadowano {len(patterns)} wzorców z .gitignore")
        else:
            print("📋 Brak pliku .gitignore lub jest pusty")
    else:
        print("📋 Pomijam .gitignore (--no-gitignore)")
    
    print(f"\n🔍 Rozpoczynam skanowanie...\n")
    
    # Zapisz pliki
    try:
        processed, ignored, too_large = save_file_contents(
            project_dir,
            output_file,
            gitignore_spec,
            args.verbose,
            args.max_size,
            custom_extensions,
            custom_dirs,
            custom_files
        )
        
        # Statystyki
        print(f"\n{'=' * 60}")
        print(f"✅ ZAKOŃCZONO")
        print(f"{'=' * 60}")
        print(f"📊 Przetworzone pliki:     {processed}")
        print(f"⏭️  Zignorowane pliki:     {ignored}")
        print(f"⚠️  Za duże pliki:         {too_large}")
        print(f"📦 Suma:                   {processed + ignored + too_large}")
        print(f"💾 Zapisano do:            {output_file}")
        
        if output_file.exists():
            size_mb = get_file_size_mb(output_file)
            print(f"📏 Rozmiar pliku:          {size_mb:.2f}MB")
        
        print(f"{'=' * 60}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Błąd krytyczny: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())