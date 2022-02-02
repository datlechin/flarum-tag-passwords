import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import IndexPage from 'flarum/forum/components/IndexPage';
import TagLinkButton from 'flarum/tags/components/TagLinkButton';
import icon from 'flarum/common/helpers/icon';
import TagPasswordRequired from './components/TagPasswordRequired';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.isUnlocked = Model.attribute('isUnlocked');
  Tag.prototype.password = Model.attribute('password');

  extend(IndexPage.prototype, 'view', function (vdom) {
    const tag = this.currentTag();

    if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
      vdom.children[1].children[0].children[1].children = [TagPasswordRequired.component({ currentTag: tag })];
    }
  });

  extend(IndexPage.prototype, 'sidebarItems', function (items) {
    const tag = this.currentTag();

    if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
      const item = items.get('newDiscussion');

      item.children = app.translator.trans('core.forum.index.cannot_start_discussion_button');
      item.attrs.disabled = true;
    }
  });

  extend(TagLinkButton.prototype, 'view', function (vdom) {
    const tag = this.attrs.model;

    if (tag.isPasswordProtected() && !tag.isUnlocked()) {
      vdom.children.push(icon('fas fa-lock'));
    }
  });
});
