import { extend } from 'flarum/common/extend';
import Discussion from 'flarum/common/models/Discussion';
import Badge from 'flarum/common/components/Badge';
import app from 'flarum/forum/app';

export default function addProtectionBadge() {
  extend(Discussion.prototype, 'badges', function (badges) {
    if (this.numberOfProtectedTags() > 0) {
      const hasPw = this.protectedPasswordTags()?.length > 0;
      const hasGroup = this.protectedGroupPermissionTags()?.length > 0;

      let icon = 'fas fa-lock';
      if (hasGroup && !hasPw) {
        icon = 'fas fa-user-lock';
      }

      badges.add(
        'protected',
        <Badge type="protected" icon={icon} label={app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.multiple')} />
      );
    }
  });
}
