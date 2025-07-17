import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react-native';
import { wordList } from '@/data/wordList';

type LetterState = 'normal' | 'excluded' | 'included';

interface LetterStates {
  [key: string]: LetterState;
}

const QWERTY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export default function WordleCheater() {
  const [pattern, setPattern] = useState('');
  const [letterStates, setLetterStates] = useState<LetterStates>({});
  const [keyboardExpanded, setKeyboardExpanded] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [hiddenInputValue, setHiddenInputValue] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);

  const excludedLetters = useMemo(() => {
    return Object.keys(letterStates)
      .filter(letter => letterStates[letter] === 'excluded')
      .join('');
  }, [letterStates]);

  const includedLetters = useMemo(() => {
    return Object.keys(letterStates)
      .filter(letter => letterStates[letter] === 'included')
      .join('');
  }, [letterStates]);

  const filteredWords = useMemo(() => {
    // If no pattern but we have letter constraints, treat as ?????
    const hasLetterConstraints =
      excludedLetters.length > 0 || includedLetters.length > 0;
    const effectivePattern =
      !pattern.trim() && hasLetterConstraints ? '?????' : pattern;

    if (!effectivePattern.trim()) return [];

    const patternRegex = new RegExp(
      '^' + effectivePattern.toLowerCase().replace(/[\?\s]/g, '[a-z]') + '$'
    );

    const excluded = excludedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));
    const included = includedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));

    const results = wordList.filter(word => {
      // Check if word matches pattern
      if (!patternRegex.test(word)) return false;

      // Check if word contains excluded letters
      if (excluded.some(letter => word.includes(letter))) return false;

      // Check if word contains all included letters
      if (
        included.length > 0 &&
        !included.every(letter => word.includes(letter))
      )
        return false;

      return true;
    });

    // Sort by word frequency/commonality (if available) or alphabetically
    return results.sort().slice(0, 100); // Increased limit to 100
  }, [pattern, excludedLetters, includedLetters]);

  const totalMatches = useMemo(() => {
    // If no pattern but we have letter constraints, treat as ?????
    const hasLetterConstraints =
      excludedLetters.length > 0 || includedLetters.length > 0;
    const effectivePattern =
      !pattern.trim() && hasLetterConstraints ? '?????' : pattern;

    if (!effectivePattern.trim()) return 0;

    const patternRegex = new RegExp(
      '^' + effectivePattern.toLowerCase().replace(/[\?\s]/g, '[a-z]') + '$'
    );
    const excluded = excludedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));
    const included = includedLetters
      .toLowerCase()
      .split('')
      .filter(l => l.match(/[a-z]/));

    return wordList.filter(word => {
      if (!patternRegex.test(word)) return false;
      if (excluded.some(letter => word.includes(letter))) return false;
      if (
        included.length > 0 &&
        !included.every(letter => word.includes(letter))
      )
        return false;
      return true;
    }).length;
  }, [pattern, excludedLetters, includedLetters]);

  const clearAll = () => {
    setPattern('');
    setLetterStates({});
    setKeyboardExpanded(true); // Expand keyboard when clearing to help user start fresh
    setSelectedPosition(null);
    setHiddenInputValue('');
    hiddenInputRef.current?.blur();
  };

  const handleBoxPress = (position: number) => {
    if (selectedPosition === position) {
      // Tapping the same position again - clear it
      const currentPattern = Array.from(
        { length: 5 },
        (_, i) => pattern[i] || ' '
      );
      const oldLetter = currentPattern[position];
      currentPattern[position] = ' ';

      // Convert back to string, keeping all positions
      const newPatternString = currentPattern.join('');
      setPattern(newPatternString);
      setSelectedPosition(null);

      // Remove the old letter from letter states if it was auto-included
      if (
        oldLetter &&
        oldLetter !== '?' &&
        oldLetter !== '' &&
        oldLetter !== ' ' &&
        oldLetter.match(/[a-z]/)
      ) {
        setLetterStates(prev => {
          const newStates = { ...prev };
          delete newStates[oldLetter];
          return newStates;
        });
      }
    } else {
      // New position selected - show keyboard
      setSelectedPosition(position);
      setHiddenInputValue('');

      if (Platform.OS === 'web') {
        // On web, focus immediately without delay
        hiddenInputRef.current?.focus();
      } else {
        // On mobile, use small delay
        setTimeout(() => {
          hiddenInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleHiddenInputChange = (text: string) => {
    if (selectedPosition === null) return;

    // Only allow letters, take the last character typed
    const letter = text
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .slice(-1);

    if (letter) {
      // Convert pattern to a proper 5-element array
      const currentPattern = Array.from(
        { length: 5 },
        (_, i) => pattern[i] || ' '
      );
      const oldLetter = currentPattern[selectedPosition];
      currentPattern[selectedPosition] = letter;

      // Convert back to string, keeping all positions
      const newPatternString = currentPattern.join('');
      setPattern(newPatternString);

      // Update letter states
      setLetterStates(prev => {
        const newStates = { ...prev };

        // Remove old letter if it was auto-included
        if (
          oldLetter &&
          oldLetter !== '?' &&
          oldLetter !== '' &&
          oldLetter !== ' ' &&
          oldLetter.match(/[a-z]/)
        ) {
          delete newStates[oldLetter];
        }

        // Add new letter as included
        newStates[letter] = 'included';

        return newStates;
      });

      // Hide keyboard and clear selection
      setSelectedPosition(null);
      hiddenInputRef.current?.blur();
      setHiddenInputValue('');
    }
  };

  const handleLetterPress = (letter: string) => {
    // Don't allow changing state of letters that are in the pattern
    const patternLetters = pattern.replace(/[\?\s]/g, '').split('');
    if (patternLetters.includes(letter)) {
      return; // Exit early if letter is in pattern
    }

    setLetterStates(prev => {
      const currentState = prev[letter] || 'normal';
      let newState: LetterState;

      switch (currentState) {
        case 'normal':
          newState = 'excluded';
          break;
        case 'excluded':
          newState = 'included';
          break;
        case 'included':
          newState = 'normal';
          break;
        default:
          newState = 'normal';
      }

      if (newState === 'normal') {
        const { [letter]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [letter]: newState,
      };
    });
  };

  const getLetterStyle = (letter: string) => {
    const patternLetters = pattern.replace(/[\?\s]/g, '').split('');
    const isInPattern = patternLetters.includes(letter);
    const state = letterStates[letter] || 'normal';

    if (isInPattern) {
      return [styles.keyboardKey, styles.includedKey, styles.lockedKey];
    }

    switch (state) {
      case 'excluded':
        return [styles.keyboardKey, styles.excludedKey];
      case 'included':
        return [styles.keyboardKey, styles.includedKey];
      default:
        return [styles.keyboardKey];
    }
  };

  const getLetterTextStyle = (letter: string) => {
    const state = letterStates[letter] || 'normal';
    switch (state) {
      case 'excluded':
        return [styles.keyText, styles.excludedText];
      case 'included':
        return [styles.keyText, styles.includedText];
      default:
        return [styles.keyText];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Wordle Cheater</Text>
          <Text style={styles.subtitle}>
            Find possible words for your Wordle puzzle
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Word Pattern</Text>
            <Text style={styles.hint}>
              Use ? for unknown letters (e.g., ?o??y)
            </Text>
            <View style={styles.inputContainer}>
              {Platform.OS === 'web' && selectedPosition !== null && (
                <Text style={styles.webInputHint}>
                  Type a letter for position {selectedPosition + 1}
                </Text>
              )}
              <View style={styles.patternDisplay}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.letterBox,
                      pattern[index] &&
                        pattern[index] !== '?' &&
                        pattern[index] !== ' ' &&
                        styles.letterBoxFilled,
                      selectedPosition === index && styles.letterBoxSelected,
                    ]}
                    onPress={() => handleBoxPress(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.letterText}>
                      {pattern[index] && pattern[index] !== ' '
                        ? pattern[index]
                        : '?'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hidden input for native keyboard */}
              <TextInput
                ref={hiddenInputRef}
                style={[
                  Platform.OS === 'web' ? styles.webInput : styles.hiddenInput,
                  Platform.OS === 'web' &&
                    selectedPosition === null &&
                    styles.webInputHidden,
                ]}
                value={hiddenInputValue}
                onChangeText={handleHiddenInputChange}
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={() => setSelectedPosition(null)}
                placeholder={
                  Platform.OS === 'web' && selectedPosition !== null
                    ? 'Type letter...'
                    : ''
                }
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <RotateCcw size={20} color="#FFFFFF" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroupLast}>
              <TouchableOpacity
                style={styles.keyboardHeader}
                onPress={() => setKeyboardExpanded(!keyboardExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.label}>Letter Status</Text>
                {keyboardExpanded ? (
                  <ChevronUp size={24} color="#2d3748" />
                ) : (
                  <ChevronDown size={24} color="#2d3748" />
                )}
              </TouchableOpacity>

              {keyboardExpanded && (
                <>
                  <Text style={styles.hint}>
                    Tap once to exclude • Tap twice to include
                  </Text>

                  <View style={styles.keyboard}>
                    {QWERTY_ROWS.map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.keyboardRow}>
                        {row.map(letter => (
                          <TouchableOpacity
                            key={letter}
                            style={getLetterStyle(letter)}
                            onPress={() => handleLetterPress(letter)}
                            activeOpacity={0.7}
                          >
                            <Text style={getLetterTextStyle(letter)}>
                              {letter.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>

                  <View style={styles.topLegendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, styles.excludedKey]} />
                      <Text style={styles.legendText}>
                        Excluded ({excludedLetters.length})
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, styles.includedKey]} />
                      <Text style={styles.legendText}>
                        Included ({includedLetters.length})
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.resultsHeader}>
            <Search size={24} color="#2d3748" />
            <Text style={styles.resultsTitle}>
              Possible Words ({filteredWords.length}
              {totalMatches > filteredWords.length && ` of ${totalMatches}`})
            </Text>
          </View>
          {totalMatches > filteredWords.length && (
            <Text style={styles.truncationWarning}>
              Showing first {filteredWords.length} results. Refine your search
              for fewer matches.
            </Text>
          )}

          {pattern.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Enter a word pattern to see possible matches
              </Text>
            </View>
          ) : filteredWords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No words found matching your criteria
              </Text>
            </View>
          ) : (
            <View style={styles.wordsGrid}>
              {filteredWords.map((word, index) => (
                <TouchableOpacity key={index} style={styles.wordCard}>
                  <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputGroupLast: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputContainer: {
    gap: 16,
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
  },
  webInput: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    height: 40,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 16,
    zIndex: 10,
  },
  webInputHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  webInputHint: {
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },

  patternDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  letterBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  letterBoxFilled: {
    borderColor: '#059669',
    backgroundColor: '#d1fae5',
  },
  letterBoxSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
    borderWidth: 3,
  },
  letterText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  keyboard: {
    gap: 8,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keyboardKey: {
    minWidth: 36,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 8,
  },
  excludedKey: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  includedKey: {
    backgroundColor: '#d1fae5',
    borderColor: '#059669',
  },
  lockedKey: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#dbeafe',
  },
  keyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  excludedText: {
    color: '#dc2626',
  },
  includedText: {
    color: '#059669',
  },
  topLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    gap: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsHeader: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
    gap: 8,
    paddingTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  truncationWarning: {
    fontSize: 14,
    color: '#d97706',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordCard: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 70,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
});
