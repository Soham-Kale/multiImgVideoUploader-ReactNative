import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';

/**
 * MentionInput - Text input with @mention support
 * Detects @ mentions and provides autocomplete suggestions
 */
const MentionInput = ({
  value,
  onChangeText,
  placeholder = 'Write a caption...',
  maxLength = 2200,
  onMentionSelect,
  ...props
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const inputRef = useRef(null);

  // Mock user suggestions (in production, this would come from a user database)
  const mockUsers = [
    { id: '1', username: 'johndoe', name: 'John Doe' },
    { id: '2', username: 'janedoe', name: 'Jane Doe' },
    { id: '3', username: 'alice', name: 'Alice Smith' },
    { id: '4', username: 'bob', name: 'Bob Johnson' },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  /**
   * Handle text change and detect @ mentions
   */
  const handleTextChange = useCallback(
    (text) => {
      onChangeText(text);

      // Find @ mentions
      const atIndex = text.lastIndexOf('@');
      if (atIndex !== -1) {
        const afterAt = text.substring(atIndex + 1);
        const spaceIndex = afterAt.indexOf(' ');
        const newlineIndex = afterAt.indexOf('\n');

        if (spaceIndex === -1 && newlineIndex === -1) {
          // Still typing mention
          setMentionQuery(afterAt);
          setMentionStartIndex(atIndex);
          setShowSuggestions(true);
        } else {
          // Mention completed
          setShowSuggestions(false);
          setMentionQuery('');
          setMentionStartIndex(-1);
        }
      } else {
        // No @ found
        setShowSuggestions(false);
        setMentionQuery('');
        setMentionStartIndex(-1);
      }
    },
    [onChangeText]
  );

  /**
   * Insert mention into text
   */
  const insertMention = useCallback(
    (username) => {
      if (mentionStartIndex === -1) return;

      const beforeMention = value.substring(0, mentionStartIndex + 1);
      const afterMention = value.substring(
        mentionStartIndex + 1 + mentionQuery.length
      );
      const newText = `${beforeMention}${username} ${afterMention}`;

      onChangeText(newText);
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartIndex(-1);

      if (onMentionSelect) {
        onMentionSelect(username);
      }
    },
    [value, mentionStartIndex, mentionQuery, onChangeText, onMentionSelect]
  );

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        maxLength={maxLength}
        {...props}
      />
      {showSuggestions && filteredUsers.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => insertMention(item.username)}>
                <View style={styles.suggestionAvatar}>
                  <Text style={styles.suggestionAvatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionUsername}>{item.username}</Text>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionUsername: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionName: {
    color: '#666',
    fontSize: 12,
  },
});

export default MentionInput;

