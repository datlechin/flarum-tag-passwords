import Tooltip from 'flarum/common/components/Tooltip';
import humanTime from 'flarum/common/helpers/humanTime';
import avatar from 'flarum/common/helpers/avatar';
import Link from 'flarum/common/components/Link';

export default function tooltipForDiscussionAvatar(discussion, className) {
  const user = discussion.user();
  let attributes = { ago: humanTime(discussion.createdAt()) };
  let url = '#';
  let avatarDisplay = (
    <span class="Avatar Avatar--anonymous" loading="lazy">
      ?
    </span>
  );
  if (discussion.isProtectedTagDisplayedForDiscussionAvatar()) {
    if (user) {
      attributes.user = user;
      url = app.route.user(user);
      avatarDisplay = avatar(user || null, { title: '' });
    }
  }

  return (
    <Tooltip text={app.translator.trans('core.forum.discussion_list.started_text', attributes)} position="right">
      <Link className={className} href={url}>
        {avatarDisplay}
      </Link>
    </Tooltip>
  );
}
