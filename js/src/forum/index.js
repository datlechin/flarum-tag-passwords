import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import IndexPage from 'flarum/forum/components/IndexPage';
import TagLinkButton from 'flarum/tags/components/TagLinkButton';
import icon from 'flarum/common/helpers/icon';
import TagPasswordRequired from './components/TagPasswordRequired';
import TagGroupRequired from './components/TagGroupRequired';

import TagsPage from 'flarum/tags/components/TagsPage';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import sortTags from 'flarum/tags/common/utils/sortTags';
import classList from 'flarum/common/utils/classList';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
import Link from 'flarum/common/components/Link';
import humanTime from 'flarum/common/helpers/humanTime';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isGroupProtected = Model.attribute('isGroupProtected');
  Tag.prototype.isUnlocked = Model.attribute('isUnlocked');
  Tag.prototype.password = Model.attribute('password');
  Tag.prototype.isLockedIconDisplayed = Model.attribute('isLockedIconDisplayed');
  Tag.prototype.isProtectedTagDisplayedForSidebar = Model.attribute('isProtectedTagDisplayedForSidebar');
  Tag.prototype.isProtectedTagDisplayedForTagsPage = Model.attribute('isProtectedTagDisplayedForTagsPage');

  extend(IndexPage.prototype, 'view', function (vdom) {
    const tag = this.currentTag();

    if (tag && !tag.isUnlocked()) {
      if (tag.isGroupProtected()) {
        vdom.children[1].children[0].children[1].children = [TagGroupRequired.component({ currentTag: tag })];
      } else if (tag.isPasswordProtected()) {
        vdom.children[1].children[0].children[1].children = [TagPasswordRequired.component({ currentTag: tag })];
      }
    }
  });

  extend(IndexPage.prototype, 'sidebarItems', function (items) {
    const tag = this.currentTag();

    if (tag && (tag.isPasswordProtected() || tag.isGroupProtected()) && !tag.isUnlocked()) {
      const item = items.get('newDiscussion');

      item.children = app.translator.trans('core.forum.index.cannot_start_discussion_button');
      item.attrs.disabled = true;
    }
  });

  extend(TagLinkButton.prototype, 'view', function (vdom) {
    const tag = this.attrs.model;

    if (tag.isPasswordProtected()) {
      if (tag.isUnlocked()) {
        if (tag.isLockedIconDisplayed() == true) {
          vdom.children.push(icon('fas fa-unlock'));
        }
      } else if (tag.isProtectedTagDisplayedForSidebar() == true) {
        vdom.children.push(icon('fas fa-lock'));
      } else {
        vdom.attrs.className += ' hiddenTag';
      }
    }
    if (tag.isGroupProtected()) {
      if (tag.isUnlocked()) {
        if (tag.isLockedIconDisplayed() == true) {
          vdom.children.push(icon('fas fa-unlock'));
        }
      } else if (tag.isProtectedTagDisplayedForSidebar() == true) {
        vdom.children.push(icon('fas fa-user-lock'));
      } else {
        vdom.attrs.className += ' hiddenTag';
      }
    }
  });

  override(TagsPage.prototype, 'tagTileView', function (original, ...args) {
    if (args.length > 0 && args[0] instanceof Tag) {
      const tag = args[0];
      if (tag.isGroupProtected() || tag.isPasswordProtected()) {
        if (tag.isUnlocked()) {
          return original(...args);
        } else if (tag.isProtectedTagDisplayedForTagsPage() == true) {
          const children = sortTags(tag.children() || []);

          return (
            <li className={classList('TagTile', { colored: tag.color() }, textContrastClass(tag.color()))} style={{ '--tag-bg': tag.color() }}>
              <Link className="TagTile-info" href={app.route.tag(tag)}>
                {tag.icon() && tagIcon(tag, {}, { useColor: false })}
                {tag.isGroupProtected() ? <div class="TagsPageGroupProtection"></div> : <div class="TagsPagePasswordProtection"></div>}
                <h3 className="TagTile-name">{tag.name()}</h3>

                <p className="TagTile-description">{tag.description()}</p>
                {!!children && (
                  <div className="TagTile-children">{children.map((child) => [<Link href={app.route.tag(child)}>{child.name()}</Link>, ' '])}</div>
                )}
              </Link>

              <span className="TagTile-lastPostedDiscussion">
                {tag.isGroupProtected() ? (
                  <div>
                    {icon('fas fa-user-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.group_protected')}
                  </div>
                ) : (
                  <div>
                    {icon('fas fa-lock')} {app.translator.trans('datlechin-tag-passwords.forum.tags_page.password_protected')}
                  </div>
                )}
              </span>
            </li>
          );
        } else {
          return '';
        }
      } else {
        return original(...args);
      }
    } else {
      return original(...args);
    }
  });
});
