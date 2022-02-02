import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Stream from 'flarum/common/utils/Stream';
import Button from 'flarum/common/components/Button';

export default class TagPasswordRequired extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.password = Stream('');
    this.loading = false;
    this.invalid = false;

    this.tag = this.attrs.currentTag;
  }

  view() {
    return (
      <div className="TagPasswordRequired">
        <form onsubmit={this.onsubmit.bind(this)}>
          <div className="Form-group">
            <h3>{app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.title')}</h3>
            <input className={'FormControl' + (this.invalid ? ' invalid' : '')} bidi={this.password} disabled={this.loading} />
          </div>
          <Button type="submit" className="Button Button--primary" loading={this.loading}>
            {app.translator.trans('datlechin-tag-passwords.forum.tag_password_required.button_submit')}
          </Button>
        </form>
      </div>
    );
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;
    this.invalid = false;

    app
      .request({
        url: app.forum.attribute('apiUrl') + '/datlechin/tag-passwords/auth',
        method: 'POST',
        body: {
          data: {
            id: this.tag.id(),
            password: this.password,
          },
        },
      })
      .then((result) => {
        this.tag.pushAttributes({ isUnlocked: true });
        this.loading = false;
        this.invalid = false;
        m.redraw();
      })
      .catch((error) => {
        this.invalid = true;
        this.loading = false;
      });
  }
}
