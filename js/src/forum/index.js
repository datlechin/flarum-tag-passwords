import app from 'flarum/forum/app';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import Discussion from 'flarum/common/models/Discussion';
import editTagsPage from './editTagsPage';
import editPostsUserPage from './editPostsUserPage';
import editDiscussionList from './editDiscussionList';
import editIndexPage from './editIndexPage';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.isUnlocked = Model.attribute('isUnlocked');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.isLockedIconDisplayed = Model.attribute('isLockedIconDisplayed');
  Tag.prototype.isProtectedTagDisplayedForSidebar = Model.attribute('isProtectedTagDisplayedForSidebar');
  Tag.prototype.isProtectedTagDisplayedForTagsPage = Model.attribute('isProtectedTagDisplayedForTagsPage');
  Discussion.prototype.protectedPasswordTags = Model.attribute('protectedPasswordTags');
  Discussion.prototype.protectedGroupPermissionTags = Model.attribute('protectedGroupPermissionTags');
  Discussion.prototype.numberOfProtectedTags = Model.attribute('numberOfProtectedTags');
  Discussion.prototype.isProtectedTagDisplayedForDiscussionList = Model.attribute('isProtectedTagDisplayedForDiscussionList');
  Discussion.prototype.isProtectedTagDisplayedForDiscussionAvator = Model.attribute('isProtectedTagDisplayedForDiscussionAvator');
  Discussion.prototype.isProtectedTagDisplayedForPostList = Model.attribute('isProtectedTagDisplayedForPostList');

  editDiscussionList();
  editTagsPage();
  editPostsUserPage();
  editIndexPage();
});