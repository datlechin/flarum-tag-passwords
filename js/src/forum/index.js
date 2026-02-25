import app from 'flarum/forum/app';
import addProtectionBadge from './addProtectionBadge';
import addProtectionInfo from './addProtectionInfo';
import addTagProtection from './addTagProtection';
import addDiscussionProtection from './addDiscussionProtection';
import addPostsProtection from './addPostsProtection';
import addTagsPageProtection from './addTagsPageProtection';
import addTagLabelIcons from './addTagLabelIcons';

export { default as extend } from './extend';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  addProtectionBadge();
  addProtectionInfo();
  addTagProtection();
  addDiscussionProtection();
  addPostsProtection();
  addTagsPageProtection();
  addTagLabelIcons();
});
