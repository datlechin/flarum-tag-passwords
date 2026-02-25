import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

import commonExtend from '../common/extend';

export default [
  ...commonExtend,

  new Extend.Admin()
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_unlock_icon',
        icon: 'fas fa-unlock',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_unlock_icon'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_protected_tag_from_sidebar',
        icon: 'fas fa-bars',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_sidebar'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_protected_tag_from_tags_page',
        icon: 'fas fa-th-list',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_tags_page'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_protected_tag_from_discussion_list',
        icon: 'fas fa-list',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_list'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_discussion_avatar',
        icon: 'fas fa-user-secret',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.discussion.avatar'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_protected_tag_from_post_list',
        icon: 'fas fa-pen-square',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_post_list'),
        allowGuest: true,
      }),
      'view'
    )
    .permission(
      () => ({
        permission: 'flarum-tag-passwords.display_protected_tag_from_discussion_page',
        icon: 'fas fa-link',
        label: app.translator.trans('datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_page'),
        allowGuest: true,
      }),
      'view'
    ),
];
