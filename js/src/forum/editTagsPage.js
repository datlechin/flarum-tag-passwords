import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import TagLinkButton from 'flarum/tags/components/TagLinkButton';
import icon from 'flarum/common/helpers/icon';
import TagsPage from 'flarum/tags/components/TagsPage';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import sortTags from 'flarum/tags/common/utils/sortTags';
import classList from 'flarum/common/utils/classList';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import ItemList from 'flarum/common/utils/ItemList';
import tagLabel from '../common/helpers/tagLabel';

export default function () {
  function amendViewForTag(vdom, tag, isProtected, lockIcon) {
    if (isProtected) {
      if (tag.isUnlocked()) {
        if (tag.isLockedIconDisplayed()) {
          vdom.children.push(icon('fas fa-unlock'));
        }
      } else if (tag.isProtectedTagDisplayedForSidebar()) {
        vdom.children.push(lockIcon);
      } else {
        vdom.attrs.className += ' hiddenTag';
      }
    }
  }

  function amendTagTileHeading(tag) {
    if (tag.isGroupProtected() && !tag.isUnlocked()) {
      return <div class="TagsPageGroupProtection"></div>;
    } else if (tag.isPasswordProtected() && !tag.isUnlocked()) {
      return <div class="TagsPagePasswordProtection"></div>;
    } else {
      return <></>;
    }
  }

  function amendTagTileLastPostedDiscussion(tag) {
    if (tag.isGroupProtected() && !tag.isUnlocked()) {
      return (
        <div>
          {icon('fas fa-user-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.group_protected')}
        </div>
      );
    } else if (tag.isPasswordProtected() && !tag.isUnlocked()) {
      return (
        <div>
          {icon('fas fa-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.password_protected')}
        </div>
      );
    } else {
      const lastPostedDiscussion = tag.lastPostedDiscussion();
      if (lastPostedDiscussion) {
        if (lastPostedDiscussion.numberOfProtectedTags() > 0) {
          const protectedPasswordTags = lastPostedDiscussion.protectedPasswordTags();
          const isProtectedPasswordTags = protectedPasswordTags.length > 0;
          const protectedGroupPermissionTags = lastPostedDiscussion.protectedGroupPermissionTags();
          const isProtectedGroupPermissionTags = protectedGroupPermissionTags.length > 0;

          const protectedTags = protectedPasswordTags.concat(protectedGroupPermissionTags);
          return (
            <Link className="TagTile-lastPostedDiscussion" href={'/t/' + protectedTags[0].slug}>
              <span className="TagTile-lastPostedDiscussion-title">
                {isProtectedGroupPermissionTags ? icon('fas fa-user-lock') : <></>}
                {isProtectedPasswordTags ? icon('fas fa-lock') : <></>}
                {isProtectedGroupPermissionTags && isProtectedPasswordTags
                  ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.multiple')
                  : isProtectedGroupPermissionTags
                  ? app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.group_protected')
                  : app.translator.trans('datlechin-tag-passwords.forum.tags_page.discussion.password_protected')}
              </span>
              {humanTime(lastPostedDiscussion.lastPostedAt())}
            </Link>
          );
        } else {
          return (
            <Link className="TagTile-lastPostedDiscussion" href={app.route.discussion(lastPostedDiscussion, lastPostedDiscussion.lastPostNumber())}>
              <span className="TagTile-lastPostedDiscussion-title">{lastPostedDiscussion.title()}</span>
              {humanTime(lastPostedDiscussion.lastPostedAt())}
            </Link>
          );
        }
      } else {
        return <span className="TagTile-lastPostedDiscussion" />;
      }
    }
  }

  /**
   * Used for amend the Tags Page footer of secondary tags
   * @param {*} cloud
   * @returns
   */
  function processCloudView(cloud) {
    return <div className="TagCloud">{cloud.map((tag) => [tagLabel(tag, { link: true }, tag.isProtectedTagDisplayedForTagsPage()), ' '])}</div>;
  }

  extend(TagLinkButton.prototype, 'view', function (vdom) {
    const tag = this.attrs.model;
    amendViewForTag(vdom, tag, tag.isPasswordProtected(), icon('fas fa-lock'));
    amendViewForTag(vdom, tag, tag.isGroupProtected(), icon('fas fa-user-lock'));
  });

  override(TagsPage.prototype, 'tagTileView', function (original, ...args) {
    if (args.length > 0 && args[0] instanceof Tag) {
      const tag = args[0];
      if (tag.isUnlocked() || (!tag.isGroupProtected() && !tag.isPasswordProtected()) || tag.isProtectedTagDisplayedForTagsPage()) {
        const children = sortTags(tag.children() || []);

        return (
          <li className={classList('TagTile', { colored: tag.color() }, textContrastClass(tag.color()))} style={{ '--tag-bg': tag.color() }}>
            <Link className="TagTile-info" href={app.route.tag(tag)}>
              {tag.icon() && tagIcon(tag, {}, { useColor: false })}
              {amendTagTileHeading(tag)}
              <h3 className="TagTile-name">{tag.name()}</h3>

              <p className="TagTile-description">{tag.description()}</p>
              {!!children && (
                <div className="TagTile-children">
                  {children.map((child) => {
                    let iconObject = null;
                    if (child.isPasswordProtected()) {
                      if (child.isUnlocked()) {
                        if (child.isLockedIconDisplayed()) {
                          iconObject = icon('fas fa-unlock', { style: { fontSize: '13px', float: 'none' } });
                        }
                      } else if (child.isProtectedTagDisplayedForTagsPage()) {
                        iconObject = icon('fas fa-lock', { style: { fontSize: '13px', float: 'none' } });
                      } else {
                        return <></>;
                      }
                    }
                    if (child.isGroupProtected()) {
                      if (child.isUnlocked()) {
                        if (child.isLockedIconDisplayed()) {
                          iconObject = icon('fas fa-unlock', { style: { fontSize: '13px', float: 'none' } });
                        }
                      } else if (child.isProtectedTagDisplayedForTagsPage()) {
                        iconObject = icon('fas fa-user-lock', { style: { fontSize: '13px', float: 'none' } });
                      } else {
                        return <></>;
                      }
                    }

                    return [
                      <Link href={app.route.tag(child)}>
                        {child.name()} {iconObject}
                      </Link>,
                      ' ',
                    ];
                  })}
                </div>
              )}
            </Link>

            <span className="TagTile-lastPostedDiscussion">{amendTagTileLastPostedDiscussion(tag)}</span>
          </li>
        );
      } else {
        return '';
      }
    } else {
      return original(...args);
    }
  });

  override(TagsPage.prototype, 'contentItems', function () {
    const items = new ItemList();

    if (this.loading) {
      items.add('loading', <LoadingIndicator />);
    } else {
      const pinned = this.tags.filter((tag) => tag.position() !== null);
      const cloud = this.tags.filter((tag) => tag.position() === null);

      items.add('tagTiles', this.tagTileListView(pinned), 100);

      if (cloud.length) {
        items.add('cloud', processCloudView(cloud), 10);
      }
    }

    return items;
  });
}
