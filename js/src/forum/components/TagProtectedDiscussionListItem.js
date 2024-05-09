import app from 'flarum/forum/app';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionControls from 'flarum/utils/DiscussionControls';
import classList from 'flarum/common/utils/classList';
import Link from 'flarum/common/components/Link';
import Tooltip from 'flarum/common/components/Tooltip';
import humanTime from 'flarum/common/helpers/humanTime';
import avatar from 'flarum/common/helpers/avatar';
import icon from 'flarum/common/helpers/icon';
import tooltipForPermission from '../../common/helpers/tooltipForPermission';

export default class TagProtectedDiscussionListItem extends DiscussionListItem {
  view() {
    const discussion = this.attrs.discussion;
    const tags = discussion.tags();

    const controls = DiscussionControls.controls(discussion, this).toArray();
    const attrs = this.elementAttrs();
    // Check whether admin wish to display protected discussion within the discussion list
    if (discussion.isProtectedTagDisplayedForDiscussionList()) {
      return (
        <div {...attrs}>
          {this.contentView()}
        </div>
      );
    } else {
      return (
        <div></div>
      );
    }
  }
  processCloudView(cloud) {
    return <div className="TagCloud">{cloud.map((tag) => [tagLabel(tag, tag.isProtectedTagDisplayedForTagsPage(), { link: true }), ' '])}</div>;
  }

  contentView() {
    const discussion = this.attrs.discussion;
    const isUnread = discussion.isUnread();
    const isRead = discussion.isRead();

    return (
      <div className={classList('DiscussionListItem-content', 'Slidable-content', { unread: isUnread, read: isRead })}>
        {this.authorAvatarView()}
        {this.badgesView()}
        {this.mainView()}
        {this.replyCountItem()}
      </div>
    );
  }

  mainView() {
    const discussion = this.attrs.discussion;
    const jumpTo = this.getJumpTo();

    const isProtectedPasswordTags = discussion.protectedPasswordTags().length > 0;
    const isProtectedGroupPermissionTags = discussion.protectedGroupPermissionTags().length > 0;
    if (isProtectedPasswordTags && !isProtectedGroupPermissionTags) {
      return <Link className="DiscussionListItem-main" href="#">
        {tooltipForPermission(discussion, app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.password_protected'), app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.password_protected'), isProtectedPasswordTags, isProtectedGroupPermissionTags)}
      </Link>
    } else if (!isProtectedPasswordTags && isProtectedGroupPermissionTags) {
      return <Link className="DiscussionListItem-main" href="#">
        {tooltipForPermission(discussion, app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.group_protected'), app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.group_protected'), isProtectedPasswordTags, isProtectedGroupPermissionTags)}
      </Link>
    } else {
      return <Link className="DiscussionListItem-main" href="#">
        {tooltipForPermission(discussion, app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.multiple'), app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.multiple'), isProtectedPasswordTags, isProtectedGroupPermissionTags)}
      </Link>
    }
  }

  authorAvatarView() {
    const discussion = this.attrs.discussion;
    if (discussion.isProtectedTagDisplayedForDiscussionAvator()) {
      const user = discussion.user();
      return (
        <Tooltip
          text={app.translator.trans('core.forum.discussion_list.started_text', { user, ago: humanTime(discussion.createdAt()) })}
          position="right"
        >
          <Link className="DiscussionListItem-author" href={user ? app.route.user(user) : '#'}>
            {avatar(user || null, { title: '' })}
          </Link>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          text={app.translator.trans('core.forum.discussion_list.started_text', {ago: humanTime(discussion.createdAt()) })}
          position="right"
        >
          <Link className="DiscussionListItem-author" href="#">
            <span class="Avatar" loading="lazy">
            {icon('fas fa-question')}
            </span>
          </Link>
        </Tooltip>
      );
    }
  }
}
