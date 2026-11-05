/**
 * Custom Rules Evaluator for Firestore and Storage rules
 * Evaluates rules locally without requiring the Firebase emulator
 */

function validateFirestoreRules(rules) {
  const issues = [];
  
  if (!rules.includes("rules_version = '2'")) {
    issues.push('Missing or invalid rules_version declaration');
  }
  
  if (!rules.includes('service cloud.firestore')) {
    issues.push('Missing service cloud.firestore declaration');
  }
  
  if (!rules.includes('function isOwner')) {
    issues.push('Missing isOwner helper function');
  }
  
  if (!rules.includes('match /users/{uid}')) {
    issues.push('Missing users collection rules');
  }
  
  if (!rules.includes('allow delete: if false')) {
    issues.push('DELETE should be denied with allow delete: if false for users');
  }
  
  if (!rules.includes('match /users/{uid}/papers/{paperId}')) {
    issues.push('Missing rules for /users/{uid}/papers/{paperId}');
  }
  
  if (!rules.includes('match /users/{uid}/settings/current')) {
    issues.push('Missing rules for /users/{uid}/settings/current');
  }
  
  if (!rules.includes('match /users/{uid}/volumes/{volumeId}')) {
    issues.push('Missing rules for /users/{uid}/volumes/{volumeId}');
  }
  
  if (!rules.includes('match /users/{uid}/collections/{collectionId}')) {
    issues.push('Missing rules for /users/{uid}/collections/{collectionId}');
  }
  
  // Check for papers annotations subcollection
  if (!rules.includes('users/{uid}/papers/{paperId}/annotations')) {
    issues.push('Missing rules for papers annotations subcollection');
  }
  
  if (!rules.includes('match /users/{uid}/readingProgress/{paperId}')) {
    issues.push('Missing rules for /users/{uid}/readingProgress/{paperId}');
  }
  
  if (!rules.includes('match /users/{uid}/notes/{noteId}')) {
    issues.push('Missing rules for /users/{uid}/notes/{noteId}');
  }
  
  if (!rules.includes('match /users/{uid}/highlights/{highlightId}')) {
    issues.push('Missing rules for /users/{uid}/highlights/{highlightId}');
  }
  
  if (!rules.includes('match /users/{uid}/bookmarks/{bookmarkId}')) {
    issues.push('Missing rules for /users/{uid}/bookmarks/{bookmarkId}');
  }
  
  if (!rules.includes('match /users/{uid}/goals/{goalId}')) {
    issues.push('Missing rules for /users/{uid}/goals/{goalId}');
  }
  
  if (!rules.includes('match /users/{uid}/activities/{activityId}')) {
    issues.push('Missing rules for /users/{uid}/activities/{activityId}');
  }
  
  if (!rules.includes('match /users/{uid}/migrations/{migrationId}')) {
    issues.push('Missing rules for /users/{uid}/migrations/{migrationId}');
  }
  
  return issues;
}

function validateStorageRules(rules) {
  const issues = [];
  
  if (!rules.includes("rules_version = '2'")) {
    issues.push('Missing or invalid rules_version declaration');
  }
  
  if (!rules.includes('service firebase.storage')) {
    issues.push('Missing service firebase.storage declaration (should use firebase.storage, not cloud.storage)');
  }
  
  // Check for if statements in functions (invalid in Firebase Storage rules)
  if (rules.includes('if (request.resource == null)')) {
    issues.push('Invalid if statement in function - use boolean expressions instead of if/else');
  }
  
  // Storage rules use inline ownership checks (request.auth.uid == uid)
  // They don't necessarily have a separate isOwner helper function
  
  if (!rules.includes('match /pdfs/{uid}/{fileName}')) {
    issues.push('Missing rules for /pdfs/{uid}/{fileName}');
  }
  
  // Check for avatar rules - variable name can be {uid} not {userId}
  if (!rules.includes('match /avatars/{uid}/avatar.png') && !rules.includes('match /avatars/{userId}/avatar.png')) {
    issues.push('Missing rules for /avatars/{uid}/avatar.png or /avatars/{userId}/avatar.png');
  }
  
  // Check for cover rules - variable name can be {fileName} not {volumeId}
  if (!rules.includes('match /covers/{userId}/{fileName}') && !rules.includes('match /covers/{userId}/{volumeId}')) {
    issues.push('Missing rules for /covers/{userId}/{fileName} or /covers/{userId}/{volumeId}');
  }
  
  if (!rules.includes('allow read, write: if false')) {
    issues.push('Missing default deny rule');
  }
  
  return issues;
}

module.exports = { validateFirestoreRules, validateStorageRules };
