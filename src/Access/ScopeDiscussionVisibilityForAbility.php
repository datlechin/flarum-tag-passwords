<?php

/*
 * This file is part of datlechin/flarum-tag-passwords.
 *
 * Copyright (c) 2022 Ngo Quoc dat.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Datlechin\TagPasswords\Access;

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibilityForAbility
{
    public function __invoke(User $actor, Builder $query, $ability)
    {
        //
    }
}
