import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import Tag from 'flarum/tags/models/Tag';
import Model from 'flarum/common/Model';
import EditTagModal from 'flarum/tags/components/EditTagModal';
import Stream from 'flarum/utils/Stream';

app.initializers.add('datlechin/flarum-tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Model.attribute('isPasswordProtected');
  Tag.prototype.password = Model.attribute('password');

  extend(EditTagModal.prototype, 'oninit', function () {
    this.isPasswordProtected = Stream(this.tag.password() || false);
    this.password = Stream(this.tag.password() || '');
  });

  extend(EditTagModal.prototype, 'fields', function (items) {
    items.add(
      'isPasswordProtected',
      <div className="Form-group">
        <label>{app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_label')}</label>
        <div>
          <label className="checkbox">
            <input type="checkbox" bidi={this.isPasswordProtected} />
            {app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_protected_label')}
          </label>
          {this.isPasswordProtected() ? (
            <input
              className="FormControl"
              bidi={this.password}
              placeholder={app.translator.trans('datlechin-tag-passwords.admin.edit_tag.password_label')}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  });

  extend(EditTagModal.prototype, 'submitData', function (data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
  });
});
