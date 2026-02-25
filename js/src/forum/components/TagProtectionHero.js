import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Stream from 'flarum/common/utils/Stream';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';

export default class TagProtectionHero extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.password = Stream('');
    this.loading = false;
    this.invalid = false;
  }

  tag() {
    return this.attrs.tag || app.currentTag();
  }

  view() {
    const tag = this.tag();

    if (!tag) return <div></div>;

    return (
      <div className="TagProtectionHero">
        <div className="TagProtectionHero-icon">
          <Icon name={tag.isPasswordProtected() ? 'fas fa-lock' : 'fas fa-user-lock'} />
        </div>
        {tag.isPasswordProtected() ? this.passwordForm() : this.groupForm()}
      </div>
    );
  }

  passwordForm() {
    return (
      <form className="TagProtectionHero-form" onsubmit={this.onsubmit.bind(this)}>
        <p className="TagProtectionHero-description">{app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.title')}</p>
        <div className="TagProtectionHero-input">
          <input
            className={'FormControl' + (this.invalid ? ' invalid' : '')}
            bidi={this.password}
            disabled={this.loading}
            type="password"
            placeholder="Enter password"
          />
        </div>
        <div className="TagProtectionHero-action">
          <Button type="submit" className="Button Button--primary" loading={this.loading}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </div>
      </form>
    );
  }

  groupForm() {
    return (
      <form className="TagProtectionHero-form" onsubmit={this.onsubmit.bind(this)}>
        <p className="TagProtectionHero-description">{app.translator.trans('datlechin-tag-passwords.forum.tag_group_required.title')}</p>
        <div className="TagProtectionHero-action">
          <Button type="submit" className="Button Button--primary" loading={this.loading}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </div>
      </form>
    );
  }

  onsubmit(e) {
    e.preventDefault();

    const tag = this.tag();
    if (!tag) return;

    this.loading = true;
    this.invalid = false;

    const body = { data: { id: tag.id() } };

    if (tag.isPasswordProtected()) {
      body.data.password = this.password;
    }

    app
      .request({
        url: app.forum.attribute('apiUrl') + '/datlechin/tag-passwords/auth',
        method: 'POST',
        body,
      })
      .then(() => {
        tag.pushAttributes({ isUnlocked: true });
        this.loading = false;
        this.invalid = false;
        m.redraw();
      })
      .catch(() => {
        this.invalid = true;
        this.loading = false;
        m.redraw();
      });
  }
}
