import Extend from 'flarum/common/extenders';
import Tag from 'ext:flarum/tags/common/models/Tag';
import Discussion from 'flarum/common/models/Discussion';
import Post from 'flarum/common/models/Post';

export default [
  new Extend.Model(Tag)
    .attribute<boolean>('isPasswordProtected')
    .attribute<boolean>('isGroupProtected')
    .attribute<boolean>('isUnlocked')
    .attribute<string>('password')
    .attribute<string>('protectedGroups')
    .attribute<boolean>('isLockedIconDisplayed')
    .attribute<boolean>('isProtectedTagDisplayedForSidebar')
    .attribute<boolean>('isProtectedTagDisplayedForTagsPage')
    .attribute<boolean>('isProtectedTagDisplayedForPostList'),

  new Extend.Model(Discussion)
    .attribute('protectedPasswordTags')
    .attribute('protectedGroupPermissionTags')
    .attribute<number>('numberOfProtectedTags')
    .attribute<boolean>('isProtectedTagDisplayedForDiscussionList')
    .attribute<boolean>('isProtectedTagDisplayedForDiscussionAvatar')
    .attribute<boolean>('isProtectedTagDisplayedForPostList')
    .attribute<boolean>('isProtectedTagDisplayedForDiscussionPage'),

  new Extend.Model(Post).attribute<boolean>('isUnlocked'),
];
