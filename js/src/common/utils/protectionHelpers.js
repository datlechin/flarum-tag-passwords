import app from 'flarum/forum/app';

export function getProtectionTitle(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  if (hasPw && hasGroup) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.multiple');
  }
  if (hasPw) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.password_protected');
  }
  return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.group_protected');
}

export function getProtectionInfo(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  if (hasPw && hasGroup) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.multiple');
  }
  if (hasPw) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.password_protected');
  }
  return app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.group_protected');
}

export function getProtectionIcons(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  return { hasPassword: hasPw, hasGroup };
}

export function getDiscussionPageTitle(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  if (hasPw && hasGroup) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.multiple');
  }
  if (hasPw) {
    return app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.password_protected');
  }
  return app.translator.trans('datlechin-tag-passwords.forum.discussion_page.title.group_protected');
}

export function getPostListTitle(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  if (hasPw && hasGroup) {
    return app.translator.trans('datlechin-tag-passwords.forum.post_list.title.multiple');
  }
  if (hasPw) {
    return app.translator.trans('datlechin-tag-passwords.forum.post_list.title.password_protected');
  }
  return app.translator.trans('datlechin-tag-passwords.forum.post_list.title.group_protected');
}

export function getPostListInfo(discussion) {
  const hasPw = discussion.protectedPasswordTags()?.length > 0;
  const hasGroup = discussion.protectedGroupPermissionTags()?.length > 0;

  if (hasPw && hasGroup) {
    return app.translator.trans('datlechin-tag-passwords.forum.post_list.info.multiple');
  }
  if (hasPw) {
    return app.translator.trans('datlechin-tag-passwords.forum.post_list.info.password_protected');
  }
  return app.translator.trans('datlechin-tag-passwords.forum.post_list.info.group_protected');
}
