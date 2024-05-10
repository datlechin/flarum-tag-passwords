import app from 'flarum/forum/app';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionControls from 'flarum/utils/DiscussionControls';
import classList from 'flarum/common/utils/classList';
import Link from 'flarum/common/components/Link';
import tooltipForPermission from '../../common/helpers/tooltipForPermission';
import tooltipForDiscussionAvatar from '../../common/helpers/tooltipForDiscussionAvatar';

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
    let title = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.multiple');
    let info = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.multiple');
    if (isProtectedPasswordTags && !isProtectedGroupPermissionTags) {
      title = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.password_protected');
      info = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.password_protected');
    } else if (!isProtectedPasswordTags && isProtectedGroupPermissionTags) {
      title = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.title.group_protected');
      info = app.translator.trans('datlechin-tag-passwords.forum.discussion_list.info.group_protected');
    }
    return <Link className="DiscussionListItem-main" href="#">
      {tooltipForPermission(discussion, "DiscussionListItem", title, info, isProtectedPasswordTags, isProtectedGroupPermissionTags)}
    </Link>
  }

  authorAvatarView() {
    const discussion = this.attrs.discussion;
    return tooltipForDiscussionAvatar(discussion, "DiscussionListItem-author")
  }
}
