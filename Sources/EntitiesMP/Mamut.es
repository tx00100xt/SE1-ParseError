327
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Mamut/Mamut.h"
#include "Models/Enemies/Mamutman/Mamutman.h"
#include "EntitiesMP/EnemyBase.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Mamutman";
//uses "EntitiesMP/AirWave";
uses "EntitiesMP/Bullet";
uses "EntitiesMP/BasicEffects";


enum MamutChar {
  0 MAT_SUMMER   "Summer",
  1 MAT_WINTER   "Winter",
};


%{
//#define REMINDER_DEATTACH_FIREBALL 555
#define CLOSE_ATTACK_RANGE 10.0f
#define DEMON_STRETCH 2.5f
FLOAT3D vAirWavelLaunchPos = (FLOAT3D(0.06f, 1.5f, -3.45f)*DEMON_STRETCH);
static FLOAT _tmLastStandingAnim =0.0f;  

// info structure
static EntityInfo eiMamut = {
  EIBT_FLESH, 2500.0f,
  0.0f, 1.5f, 0.0f,
  0.0f, 2.0f, 0.0f,
};

#define HIT_DISTANCE    13.0f
#define FIRE_BULLET     FLOAT3D(0.0f*2, 4.0f*2, -4.0f*2)
#define FIRE_AIRWAVE    FLOAT3D(0.0f*2, 0.5f*2, -4.0f*2)
#define RIDER_FRONT     FLOAT3D( 0.25f*2, 6.5f*2, 0.5f*2)
#define RIDER_MIDDLE    FLOAT3D(-0.25f*2, 5.6f*2, 1.5f*2)
#define RIDER_REAR      FLOAT3D( 0.1f*2,  4.6f*2, 2.4f*2)

#define MAMUT_STRETCH 2.5f
FLOAT3D vIceLaunchPos = (FLOAT3D(0.06f, 2.6f, 0.15f)*MAMUT_STRETCH);
//## MODEL 
static CModelObject _moModel; //Это наша модель
%}


class CMamut : CEnemyBase {
name      "Mamut";
thumbnail "Thumbnails\\Mamut.tbn";

properties:
  1 enum MamutChar m_EmcChar "Character" 'C' = MAT_SUMMER,      // character
  2 BOOL m_bFrontRider "Rider Front" 'H' = FALSE,     // front rider
  3 BOOL m_bMiddleRider "Rider Middle" 'J' = FALSE,   // middle rider
  4 BOOL m_bRearRider "Rider Rear" 'K' = FALSE,       // rear rider
  5 CEntityPointer m_penBullet,     // bullet
  6 FLOAT m_fLastShootTime = 0.0f,
  7 INDEX m_iCounter = 0,
  8 CEntityPointer m_penFireFX,
  
components:
  0 class   CLASS_BASE        	"Classes\\EnemyBase.ecl",
  1 class   CLASS_BULLET      	"Classes\\Bullet.ecl",
  2 class   CLASS_MAMUTMAN    	"Classes\\Mamutman.ecl",
  //3 class   CLASS_AIRWAVE     "Classes\\AirWave.ecl",
  4 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  5 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_MAMUT              "Models\\Enemies\\Mamut\\Mamut.mdl",
 11 texture TEXTURE_MAMUT_SUMMER     "Models\\Enemies\\Mamut\\Mamut.tex",
 12 texture TEXTURE_MAMUT_WINTER     "Models\\Enemies\\Mamut\\Mamut3.tex",
 //14 model   MODEL_AIRWAVE     		 "Models\\Enemies\\Mamut\\Projectile\\MamutProjectile.mdl",
 //15 texture TEXTURE_AIRWAVE   		 "Models\\Enemies\\Mamut\\Projectile\\MamutProjectile.tex",
 14 model   MODEL_FIREBALL     		 "ModelsMP\\Enemies\\Demon\\Projectile\\Projectile.mdl",
 15 texture TEXTURE_FIREBALL    	 "ModelsMP\\Enemies\\Demon\\Projectile\\Projectile.tex",

 20 model   MODEL_MAMUTMAN    "Models\\Enemies\\Mamutman\\Mamutman.mdl",
 21 texture TEXTURE_MAMUTMAN  "Models\\Enemies\\Mamutman\\Mamutman.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "Models\\Enemies\\Mamut\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "Models\\Enemies\\Mamut\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "Models\\Enemies\\Mamut\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "Models\\Enemies\\Mamut\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "Models\\Enemies\\Mamut\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "Models\\Enemies\\Mamut\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s was killed by a Mamut"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "Data\\Messages\\Enemies\\Mamut.txt");
    return fnm;
  };
  void Precache(void) {
    CEnemyBase::Precache();
	
	PrecacheClass(CLASS_BULLET);
    PrecacheClass(CLASS_MAMUTMAN);
    //PrecacheClass(CLASS_AIRWAVE);
	
    //PrecacheModel(MODEL_AIRWAVE);
	//PrecacheTexture(TEXTURE_AIRWAVE);
	
	PrecacheModel(MODEL_FIREBALL);
	PrecacheTexture(TEXTURE_FIREBALL);
	
    PrecacheTexture(TEXTURE_MAMUT_SUMMER);
	PrecacheTexture(TEXTURE_MAMUT_WINTER);
	
    PrecacheModel(MODEL_MAMUTMAN);
    PrecacheTexture(TEXTURE_MAMUTMAN);
	
    PrecacheSound(SOUND_IDLE);
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_DEATH);
	
	PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);
  };
  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiMamut;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // mamut can't harm mamut
    if (!IsOfClass(penInflictor, "Mamut")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // play attachmnet anim
  void PlayAttachmentAnim(INDEX iAttachment, INDEX iAnim, ULONG ulFlags) {
    CAttachmentModelObject *amo = GetModelObject()->GetAttachmentModel(iAttachment);
    if (amo!=NULL) {
      amo->amo_moModelObject.PlayAnim(iAnim, ulFlags);
    }
  };


  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(MAMUT_ANIM_DEATH, 0);
    return MAMUT_ANIM_DEATH;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MAMUT_COLLISION_BOX_DEATH);
    DropRiders(TRUE);
  };


  // drop riders
  void CreateRider(FLOAT3D &vPos, INDEX iRider) {
    // mamutman start position
    CPlacement3D pl;
    pl.pl_OrientationAngle = ANGLE3D(0,0,0);
    pl.pl_PositionVector = vPos;
    pl.RelativeToAbsolute(GetPlacement());
    // create rider
    CEntityPointer pen = CreateEntity(pl, CLASS_MAMUTMAN);
    ((CMamutman&)*pen).m_bSpawned = TRUE;
    ((CMamutman&)*pen).m_bSpawnedPosition = iRider;
    ((CMamutman&)*pen).m_penEnemy = m_penEnemy;
    ((CMamutman&)*pen).m_ttTarget = m_ttTarget;
    pen->Initialize(EVoid());
  };

  void DropRiders(BOOL bAlways) {
    if (m_bFrontRider && (bAlways || (IRnd()&1))) {
      m_bFrontRider = FALSE;
      CreateRider(RIDER_FRONT, 0);
      RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_FRONT);
    }
    if (m_bMiddleRider && (bAlways || (IRnd()&1))) {
      m_bMiddleRider = FALSE;
      CreateRider(RIDER_MIDDLE, 1);
      RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_MIDDLE);
    }
    if (m_bRearRider && (bAlways || (IRnd()&1))) {
      m_bRearRider = FALSE;
      CreateRider(RIDER_REAR, 2);
      RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_REAR);
    }
  };


  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(MAMUT_ANIM_STAND, AOF_LOOPING|AOF_NORESTART);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_FRONT, MAMUTMAN_ANIM_STANDMOUNTEDFIRST, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_MIDDLE, MAMUTMAN_ANIM_STANDMOUNTEDSECOND, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_REAR, MAMUTMAN_ANIM_STANDMOUNTEDTHIRD, 0);
  };
  void WalkingAnim(void) {
    StartModelAnim(MAMUT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_FRONT, MAMUTMAN_ANIM_MOUNTEDWALKFIRST, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_MIDDLE, MAMUTMAN_ANIM_MOUNTEDWALKSECOND, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_REAR, MAMUTMAN_ANIM_MOUNTEDWALKTHIRD, 0);
  };
  void RunningAnim(void) {
    StartModelAnim(MAMUT_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_FRONT, MAMUTMAN_ANIM_MOUNTEDRUNFIRST, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_MIDDLE, MAMUTMAN_ANIM_MOUNTEDRUNSECOND, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_REAR, MAMUTMAN_ANIM_MOUNTEDRUNTHIRD, 0);
  };
  void RotatingAnim(void) {
    StartModelAnim(MAMUT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_FRONT, MAMUTMAN_ANIM_MOUNTEDWALKFIRST, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_MIDDLE, MAMUTMAN_ANIM_MOUNTEDWALKSECOND, 0);
    PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_REAR, MAMUTMAN_ANIM_MOUNTEDWALKTHIRD, 0);
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };


/************************************************************
 *                       FIRE BULLET                        *
 ************************************************************/
  // prepare bullet
  void PrepareBullet(void) {
    // bullet start position
    CPlacement3D plBullet;
    plBullet.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBullet.pl_PositionVector = FIRE_BULLET;
    plBullet.RelativeToAbsolute(GetPlacement());
    // create bullet
    m_penBullet = CreateEntity(plBullet, CLASS_BULLET);
    // init bullet
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = 5.0f;
    m_penBullet->Initialize(eInit);
    ((CBullet&)*m_penBullet).CalcTarget(m_penEnemy, 100);
  };

  // fire bullet
  void FireBullet(void) {
    ((CBullet&)*m_penBullet).LaunchBullet(TRUE, TRUE, TRUE, FALSE);
    ((CBullet&)*m_penBullet).DestroyBullet();
  };
//#####
/*
  // fire air wave
  void FireAirWave(void) {
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_AIRWAVE, ANGLE3D(0, 0, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_AIRWAVE);
    EAirWave eLaunch;
    eLaunch.penLauncher = this;
    penProjectile->Initialize(eLaunch);
  };
*/
//#####

procedures:
/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  // Play wound animation and falling body part
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded
  { 
    StopMoving();
    // damage anim
    StartModelAnim(MAMUT_ANIM_WOUND02, 0);
    autowait(0.5f);
    // drop riders
    if (GetHealth()<600.0f) {
      DropRiders(GetHealth()<250.0f);
    }
    autowait(1.5f);

    return EReturn();
  };



/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
/*  // initial preparation
  InitializeAttack(EVoid) : CEnemyBase::InitializeAttack {
    m_fLastShootTime = 0.0f;
    jump CEnemyBase::InitializeAttack();
  };


  // attack shoot
  //AttackShoot() : CEnemyBase::AttackShoot {
  AttackShoot() : CEnemyBase::AttackEnemy {
    // shoot at enemy if possible
    if (CanAttackEnemy(m_penEnemy, Cos(AngleDeg(130.0f)))) {
      // set next shoot time
      m_fShootTime = _pTimer->CurrentTick() + m_fAttackFireTime*(1.0f + FRnd()/3.0f);
      // fire
      // mamut shoot
      if (m_fLastShootTime+4.0f<_pTimer->CurrentTick() &&
          CanAttackEnemy(m_penEnemy, Cos(AngleDeg(50.0f)))) {
        // stop moving (rotation and translation)
        StopMoving();
        autocall Fire() EReturn;
      // rider (mamutman) shoot
      } else if (m_bFrontRider || m_bMiddleRider || m_bRearRider) {
        // stop rotating
        StopRotating();
        autocall RiderFire() EReturn;
      }
    } else {
      // safety precocious from stack overflow loop
      m_fShootTime = _pTimer->CurrentTick() + 0.25f;
    }
    return ETimer();
  };

  // close shoot
  //CloseShoot() : CEnemyBase::CloseShoot {
  CloseShoot() : CEnemyBase::StopAttack {
    // shoot at enemy if possible
    if (CalcDist(m_penEnemy)<m_fCloseDistance && CanHitEnemy(m_penEnemy, Cos(AngleDeg(130.0f)))) {
      // set next shoot time
      m_fShootTime = _pTimer->CurrentTick() + m_fCloseFireTime*(1.0f + FRnd()/3.0f);
      // hit
      // mamut shoot
      if (m_fLastShootTime+4.0f<_pTimer->CurrentTick() &&
          CanHitEnemy(m_penEnemy, Cos(AngleDeg(50.0f)))) {
        // stop moving (rotaion and translation)
        StopMoving();
        autocall Hit() EReturn;
      // rider (mamutman) shoot
      } else if (m_bFrontRider || m_bMiddleRider || m_bRearRider) {
        // stop rotating
        StopRotating();
        autocall RiderFire() EReturn;
      }

    // try attack shoot
    } else {
      jump AttackShoot();
    }
    return ETimer();
  };
*/
//#####
/*
  Fire(EVoid) : CEnemyBase::Fire {
    m_fLastShootTime = _pTimer->CurrentTick();

    // fire projectile
    StartModelAnim(MAMUT_ANIM_WOUND01, 0);
    autowait(1.1f);
    FireAirWave();
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(FRnd()*0.2f);

    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    m_fLastShootTime = _pTimer->CurrentTick();

    // hit the ground
    StartModelAnim(MAMUT_ANIM_ATTACK01, 0);
    autowait(0.3f);
    if (CalcDist(m_penEnemy) < HIT_DISTANCE) {
      FLOAT3D vSource = GetPlacement().pl_PositionVector +
        FLOAT3D(en_mRotation(1, 2), en_mRotation(2, 2), en_mRotation(3, 2));
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
      // damage
      InflictRangeDamage(this, DMT_CLOSERANGE, 20.0f, vSource, 1.0f, 15.0f);
    }
    autowait(0.5f);
    if (CalcDist(m_penEnemy) < HIT_DISTANCE) {
      FLOAT3D vSource = GetPlacement().pl_PositionVector +
        FLOAT3D(en_mRotation(1, 2), en_mRotation(2, 2), en_mRotation(3, 2));
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
      // damage
      InflictRangeDamage(this, DMT_CLOSERANGE, 20.0f, vSource, 1.0f, 15.0f);
    }
    autowait(0.7f+FRnd()*0.1f);

    return EReturn();
  };
*/
  Fire(EVoid) : CEnemyBase::Fire
  {
    
    // SetDesiredTranslation???
    if (m_fMoveSpeed>0.0f) {
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, -m_fMoveSpeed));
    }
    
    //StartModelAnim(DEMON_ANIM_ATTACK, AOF_SMOOTHCHANGE);
    StartModelAnim(MAMUT_ANIM_ATTACK01, 0);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    
    SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
    
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    SpawnReminder(this, 3.0f, 0);//REMINDER_DEATTACH_FIREBALL);

    autowait(1.0f);

    // spawn particle effect
    CPlacement3D plFX=GetPlacement();
    const FLOATmatrix3D &m = GetRotationMatrix();
    plFX.pl_PositionVector=plFX.pl_PositionVector+vAirWavelLaunchPos*m;
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_COLLECT_ENERGY;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    m_penFireFX = CreateEntity(plFX, CLASS_BASIC_EFFECT);
    m_penFireFX->Initialize(ese);

    autowait(1.4f);
    

	CModelObject *pmo = &_moModel;
    //CModelObject *pmoFire = &GetModelObject()->GetAttachmentModel(DEMON_ATTACHMENT_FIREBALL)->amo_moModelObject;
    //pmoFire->StretchModel(FLOAT3D(DEMON_STRETCH, DEMON_STRETCH, DEMON_STRETCH));
	//pmo->StretchModel(FLOAT3D(DEMON_STRETCH, DEMON_STRETCH, DEMON_STRETCH));
	pmo->StretchModel(FLOAT3D(DEMON_STRETCH, DEMON_STRETCH, DEMON_STRETCH));
    autowait(2.94f-2.4f);
    
    //RemoveAttachment(DEMON_ATTACHMENT_FIREBALL);
    MaybeSwitchToAnotherPlayer();

    if (IsVisible(m_penEnemy)) {
      ShootProjectile(PRT_DEMON_FIREBALL, vAirWavelLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
    else {
      ShootProjectileAt(m_vPlayerSpotted, PRT_DEMON_FIREBALL, vAirWavelLaunchPos, ANGLE3D(0.0f, 0.0f, 0.0f));
    }
      
    autowait(1.0f);
    
    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    if (CalcDist(m_penEnemy) < 6.0f) {
      StartModelAnim(MAMUT_ANIM_WOUND01, 0);
      autowait(0.45f);
      PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
      if (CalcDist(m_penEnemy) < CLOSE_ATTACK_RANGE
        && IsInPlaneFrustum(m_penEnemy, CosFast(60.0f)))
      {
        FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
        vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 50.0f, FLOAT3D(0, 0, 0), vDirection);
      }
      autowait(1.5f);
      MaybeSwitchToAnotherPlayer();
    } else {
      // run to enemy
      m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    }
    return EReturn();
  }
//##
  RiderFire() {
    // if have any rider fire
    if (m_bFrontRider || m_bMiddleRider || m_bRearRider) {
      // prepare 
      PrepareBullet();

      // find valid rider
      INDEX iRider = IRnd()%3;
      if (iRider==0 && !m_bFrontRider) { iRider = 1; }
      if (iRider==1 && !m_bMiddleRider) { iRider = 2; }
      if (iRider==2 && !m_bRearRider) { iRider = 0; }
      if (iRider==0 && !m_bFrontRider) { iRider = 1; }
      if (iRider==1 && !m_bMiddleRider) { iRider = 2; }

      // animation
      switch (iRider) {
        case 0: PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_FRONT, MAMUTMAN_ANIM_MOUNTEDATTACKFIRST, 0); break;
        case 1: PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_MIDDLE, MAMUTMAN_ANIM_MOUNTEDATTACKSECOND, 0); break;
        case 2: PlayAttachmentAnim(MAMUT_ATTACHMENT_MAN_REAR, MAMUTMAN_ANIM_MOUNTEDATTACKTHIRD, 0); break;
      }

      // fire bullet
      autowait(0.8f);
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      FireBullet();
    }

    return EReturn();
  };


/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_tmMaxHoldBreath = 35.0f;
    en_fDensity = 4000.0f;

    // set your appearance
    GetModelObject()->StretchModel(FLOAT3D(2,2,2));
    SetModel(MODEL_MAMUT);
    ModelChangeNotify();
    if (m_EmcChar==MAT_SUMMER) {
      SetModelMainTexture(TEXTURE_MAMUT_SUMMER);
    } else {
      SetModelMainTexture(TEXTURE_MAMUT_WINTER);
    }
    SetHealth(700.0f);
    m_fMaxHealth = 700.0f;
    // set riders
    RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_FRONT);
    RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_MIDDLE);
    RemoveAttachmentFromModel(*GetModelObject(), MAMUT_ATTACHMENT_MAN_REAR);
    if (m_bFrontRider) {
      AddAttachmentToModel(this, *GetModelObject(), MAMUT_ATTACHMENT_MAN_FRONT,
        MODEL_MAMUTMAN, TEXTURE_MAMUTMAN, 0, 0, 0);
    }
    if (m_bMiddleRider) {
      AddAttachmentToModel(this, *GetModelObject(), MAMUT_ATTACHMENT_MAN_MIDDLE,
        MODEL_MAMUTMAN, TEXTURE_MAMUTMAN, 0, 0, 0);
    }
    if (m_bRearRider) {
      AddAttachmentToModel(this, *GetModelObject(), MAMUT_ATTACHMENT_MAN_REAR,
        MODEL_MAMUTMAN, TEXTURE_MAMUTMAN, 0, 0, 0);
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 25.0f);
    m_fAttackRunSpeed = FRnd() + 9.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*15.0f + 250.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*15.0f + 250.0f);
    // setup attack distances
    m_fAttackDistance = 120.0f;
    m_fCloseDistance = 14.0f;
    m_fStopDistance = 12.0f;
    INDEX iTime = 4.0f;
    if (m_bFrontRider) { iTime--; }
    if (m_bMiddleRider) { iTime--; }
    if (m_bRearRider) { iTime--; }
    m_fAttackFireTime = iTime;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 250.0f;
    m_fBodyParts = 5;
    m_fDamageWounded = 200.0f;
    m_iScore = 5000;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
