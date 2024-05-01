import extract from 'flarum/common/utils/extract';
import Link from 'flarum/common/components/Link';
import classList from 'flarum/common/utils/classList';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
import tagIcon from 'flarum/tags/common/helpers/tagIcon';
import icon from 'flarum/common/helpers/icon';

export default function tagLabel(tag, attrs = {}, showProtectedDisplayed = true, isNonProtectedDisplayed = true) {
  attrs.style = attrs.style || {};
  attrs.className = 'TagLabel ' + (attrs.className || '');

  const link = extract(attrs, 'link');
  const tagText = tag ? tag.name() : app.translator.trans('flarum-tags.lib.deleted_tag_text');

  if (tag) {
    const color = tag.color();
    if (color) {
      attrs.style['--tag-bg'] = color;
      attrs.className = classList(attrs.className, 'colored', textContrastClass(color));
    }

    if (link) {
      attrs.title = tag.description() || '';
      attrs.href = app.route('tag', { tags: tag.slug() });
    }

    if (tag.isChild()) {
      attrs.className += ' TagLabel--child';
    }
  } else {
    attrs.className += ' untagged';
  }

  let iconObject = null;
  if (tag.isPasswordProtected() || tag.isGroupProtected()) {
    if (tag.isUnlocked()) {
      if (!isNonProtectedDisplayed) {
        return <></>
      } else if (tag.isLockedIconDisplayed()) {
        iconObject = icon('fas fa-unlock', {style: {fontSize: '13px', float: 'none'}});
      }
    } else if (showProtectedDisplayed) {
      if (tag.isPasswordProtected()) {
        iconObject = icon('fas fa-lock', {style: {fontSize: '13px', float: 'none'}});
      } else {
        iconObject = icon('fas fa-user-lock', {style: {fontSize: '13px', float: 'none'}});
      }
    } else {
      return <></>
    }
  } else if (!isNonProtectedDisplayed) {
    return <></>
  }
  return m(
    link ? Link : 'span',
    attrs,
    <span className="TagLabel-text">
      {tag && tag.icon() && tagIcon(tag, { className: 'TagLabel-icon' }, { useColor: false })}
      <span className="TagLabel-name">{tagText + (iconObject? ' ': '')}
        {iconObject || null}
      </span>
    </span>
  );
}