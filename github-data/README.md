# Dane synchronizacji Planera

W tym folderze aplikacja przechowuje na GitHubie zaszyfrowany plik synchronizacji `planer-sync.enc.json`.

- Zawartość tego pliku jest szyfrowana hasłem Planera.
- Nie umieszczaj tutaj tokenów GitHub ani niezaszyfrowanych kopii danych.
- Aplikacja zapisuje i odczytuje plik bezpośrednio przez GitHub API; nie zapisuje go automatycznie w lokalnym folderze projektu.
- Zaszyfrowana synchronizacja obejmuje własne kategorie i ich kolory oraz wszystkie pozycje planera. Szybkie notatki są zapisywane osobno dla poszczególnych dni, a Notatnik pozostaje niezależny.
- Domyślna ścieżka w ustawieniach aplikacji to `github-data/planer-sync.enc.json`.
