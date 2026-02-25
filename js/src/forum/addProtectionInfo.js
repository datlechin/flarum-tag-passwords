import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Icon from 'flarum/common/components/Icon';
import Tooltip from 'flarum/common/components/Tooltip';
import Avatar from 'flarum/common/components/Avatar';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';
import tagsLabel from 'ext:flarum/tags/common/helpers/tagsLabel';
import { getProtectionTitle, getProtectionInfo, getProtectionIcons } from '../common/utils/protectionHelpers';

export default function addProtectionInfo() {
  // Hide/replace discussion list item content when protected
  extend('flarum/forum/components/DiscussionListItem', 'view', function (vdom) {
    const discussion = this.attrs.discussion;

    if (!discussion.numberOfProtectedTags() || discussion.numberOfProtectedTags() === 0) {
      return;
    }

    if (!discussion.isProtectedTagDisplayedForDiscussionList()) {
      // Hide the entire item
      vdom.tag = 'div';
      vdom.children = [];
      return;
    }
  });

  // Replace main view content with protection info
  extend('flarum/forum/components/DiscussionListItem', 'mainView', function (vdom) {
    const discussion = this.attrs.discussion;

    if (!discussion.numberOfProtectedTags() || discussion.numberOfProtectedTags() === 0) {
      return;
    }

    if (!discussion.isProtectedTagDisplayedForDiscussionList()) {
      return;
    }

    const title = getProtectionTitle(discussion);
    const info = getProtectionInfo(discussion);
    const { hasPassword, hasGroup } = getProtectionIcons(discussion);
    const tags = discussion.tags();

    vdom.tag = 'div';
    vdom.attrs = { className: 'DiscussionListItem-main' };
    vdom.children = [
      <Tooltip text={info} position="bottom">
        <Link href={app.route.discussion(discussion)} className="DiscussionListItem-main">
          <h2 className="DiscussionListItem-title">
            {hasPassword ? <Icon name="fas fa-lock" /> : null}
            {hasGroup ? <Icon name="fas fa-user-lock" /> : null}
            {' ' + title}
          </h2>
          {tagsLabel(tags, {})}
        </Link>
      </Tooltip>,
    ];
  });

  // Replace author avatar when protected
  extend('flarum/forum/components/DiscussionListItem', 'authorAvatarView', function (vdom) {
    const discussion = this.attrs.discussion;

    if (!discussion.numberOfProtectedTags() || discussion.numberOfProtectedTags() === 0) {
      return;
    }

    const user = discussion.user();
    let attributes = { ago: humanTime(discussion.createdAt()) };
    let url = '#';
    let avatarDisplay = (
      <span className="Avatar Avatar--anonymous" loading="lazy">
        ?
      </span>
    );

    if (discussion.isProtectedTagDisplayedForDiscussionAvatar() && user) {
      attributes.user = user;
      url = app.route.user(user);
      avatarDisplay = <Avatar user={user} />;
    }

    vdom.tag = Tooltip;
    vdom.attrs = {
      text: app.translator.trans('core.forum.discussion_list.started_text', attributes),
      position: 'right',
    };
    vdom.children = [
      <Link className="DiscussionListItem-author" href={url}>
        {avatarDisplay}
      </Link>,
    ];
  });
}
