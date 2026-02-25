import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Tag from 'ext:flarum/tags/common/models/Tag';
import Icon from 'flarum/common/components/Icon';
import tagIcon from 'ext:flarum/tags/common/helpers/tagIcon';
import sortTags from 'ext:flarum/tags/common/utils/sortTags';
import classList from 'flarum/common/utils/classList';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';
import tagLabel from 'ext:flarum/tags/common/helpers/tagLabel';

export default function addTagsPageProtection() {
  override('ext:flarum/tags/forum/components/TagsPage', 'tagTileView', function (original, ...args) {
    if (args.length === 0 || !(args[0] instanceof Tag)) {
      return original(...args);
    }

    const tag = args[0];
    const isProtected = tag.isPasswordProtected() || tag.isGroupProtected();

    if (!isProtected || tag.isUnlocked() || tag.isProtectedTagDisplayedForTagsPage()) {
      const children = sortTags(tag.children() || []);

      return (
        <li className={classList('TagTile', { colored: tag.color() }, textContrastClass(tag.color()))} style={{ '--tag-bg': tag.color() }}>
          <Link className="TagTile-info" href={app.route.tag(tag)}>
            {tag.icon() && tagIcon(tag, {}, { useColor: false })}
            {isProtected && !tag.isUnlocked() ? renderProtectionOverlay(tag) : null}
            <h3 className="TagTile-name">{tag.name()}</h3>
            <p className="TagTile-description">{tag.description()}</p>
            {!!children && <div className="TagTile-children">{children.map((child) => renderChildTag(child))}</div>}
          </Link>
          <span className="TagTile-lastPostedDiscussion">{renderLastPostedDiscussion(tag)}</span>
        </li>
      );
    }

    return '';
  });
}

function renderProtectionOverlay(tag) {
  if (tag.isGroupProtected()) {
    return <div className="TagsPageProtection TagsPageProtection--group"></div>;
  }
  return <div className="TagsPageProtection TagsPageProtection--password"></div>;
}

function renderChildTag(child) {
  const isProtected = child.isPasswordProtected() || child.isGroupProtected();

  if (!isProtected) {
    return [<Link href={app.route.tag(child)}>{child.name()}</Link>, ' '];
  }

  if (child.isUnlocked()) {
    const iconObj = child.isLockedIconDisplayed() ? <Icon name="fas fa-unlock" style={{ fontSize: '13px', float: 'none' }} /> : null;
    return [
      <Link href={app.route.tag(child)}>
        {child.name()} {iconObj}
      </Link>,
      ' ',
    ];
  }

  if (!child.isProtectedTagDisplayedForTagsPage()) {
    return null;
  }

  const icon = child.isGroupProtected() ? 'fas fa-user-lock' : 'fas fa-lock';
  return [
    <Link href={app.route.tag(child)}>
      {child.name()} <Icon name={icon} style={{ fontSize: '13px', float: 'none' }} />
    </Link>,
    ' ',
  ];
}

function renderLastPostedDiscussion(tag) {
  const isProtected = tag.isPasswordProtected() || tag.isGroupProtected();

  if (isProtected && !tag.isUnlocked()) {
    if (tag.isGroupProtected()) {
      return (
        <div>
          <Icon name="fas fa-user-lock" /> {app.translator.trans('datlechin-tag-passwords.forum.tags_page.group_protected')}
        </div>
      );
    }
    return (
      <div>
        <Icon name="fas fa-lock" /> {app.translator.trans('datlechin-tag-passwords.forum.tags_page.password_protected')}
      </div>
    );
  }

  const lastPostedDiscussion = tag.lastPostedDiscussion();
  if (!lastPostedDiscussion) {
    return <span className="TagTile-lastPostedDiscussion" />;
  }

  if (lastPostedDiscussion.numberOfProtectedTags() > 0) {
    const protectedPasswordTags = lastPostedDiscussion.protectedPasswordTags();
    const protectedGroupTags = lastPostedDiscussion.protectedGroupPermissionTags();
    const hasPw = protectedPasswordTags.length > 0;
    const hasGroup = protectedGroupTags.length > 0;
    const allProtectedTags = protectedPasswordTags.concat(protectedGroupTags);

    return (
      <Link className="TagTile-lastPostedDiscussion" href={'/t/' + allProtectedTags[0].slug}>
        <span className="TagTile-lastPostedDiscussion-title">
          {hasGroup ? <Icon name="fas fa-user-lock" /> : null}
          {hasPw ? <Icon name="fas fa-lock" /> : null}
          {hasPw && hasGroup
            ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.multiple')
            : hasGroup
            ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.group_protected')
            : app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.password_protected')}
        </span>
        {humanTime(lastPostedDiscussion.lastPostedAt())}
      </Link>
    );
  }

  return (
    <Link className="TagTile-lastPostedDiscussion" href={app.route.discussion(lastPostedDiscussion, lastPostedDiscussion.lastPostNumber())}>
      <span className="TagTile-lastPostedDiscussion-title">{lastPostedDiscussion.title()}</span>
      {humanTime(lastPostedDiscussion.lastPostedAt())}
    </Link>
  );
}
